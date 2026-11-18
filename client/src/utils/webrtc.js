// Lớp điều phối kết nối WebRTC DataChannel P2P giữa hai trình duyệt
export class PeerChat {
  constructor(socket, roomId, iceServers = [], onMessageCallback, onStatusCallback) {
    this.socket = socket;
    this.roomId = roomId;
    this.onMessage = onMessageCallback;
    this.onStatus = onStatusCallback;

    // Danh sách ICE Servers (STUN mặc định của Google + TURN Server cấu hình nếu có)
    const defaultIceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ];

    const configIceServers = iceServers && iceServers.length > 0 ? iceServers : defaultIceServers;

    this.peerConnection = new RTCPeerConnection({
      iceServers: configIceServers
    });

    this.dataChannel = null;
    this.init();
  }

  init() {
    // 1. Khi có ICE Candidate cục bộ, gửi qua Socket.io Signaling tới đối phương
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('signal-ice-candidate', {
          roomId: this.roomId,
          candidate: event.candidate
        });
      }
    };

    // 2. Khi đối phương tạo DataChannel và gửi sang, bên nhận sẽ lắng nghe sự kiện này
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannelEvents();
    };

    // 3. Theo dõi trạng thái kết nối WebRTC
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection.connectionState;
      if (state === 'connected') {
        this.onStatus('CONNECTED');
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        this.onStatus('DISCONNECTED');
      }
    };
  }

  setupDataChannelEvents() {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      this.onStatus('CONNECTED');
    };

    this.dataChannel.onclose = () => {
      this.onStatus('DISCONNECTED');
    };

    this.dataChannel.onerror = (err) => {
      console.error('DataChannel error:', err);
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Tin nhắn được nhận trực tiếp qua P2P RAM, không đi qua server
        this.onMessage(data);
      } catch (e) {
        console.error('Lỗi phân tích tin nhắn nhận được:', e);
      }
    };
  }

  // Phía Offerer chủ động tạo DataChannel và gửi Offer
  async createOffer() {
    try {
      this.dataChannel = this.peerConnection.createDataChannel('chat', {
        ordered: true
      });
      this.setupDataChannelEvents();

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      this.socket.emit('signal-offer', {
        roomId: this.roomId,
        sdp: offer
      });
    } catch (err) {
      console.error('Lỗi tạo WebRTC Offer:', err);
    }
  }

  // Phía Answerer nhận Offer từ Offerer và gửi lại Answer
  async handleOffer(offer) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.socket.emit('signal-answer', {
        roomId: this.roomId,
        sdp: answer
      });
    } catch (err) {
      console.error('Lỗi xử lý WebRTC Offer:', err);
    }
  }

  // Phía Offerer nhận Answer từ Answerer
  async handleAnswer(answer) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      console.error('Lỗi xử lý WebRTC Answer:', err);
    }
  }

  // Thêm ICE Candidate nhận từ đối phương
  async addIceCandidate(candidate) {
    try {
      if (candidate) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.error('Lỗi thêm ICE Candidate:', err);
    }
  }

  // Gửi tin nhắn trực tiếp qua DataChannel (P2P hoàn toàn)
  sendMessage(text, senderName = 'Tôi') {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      const payload = {
        id: Date.now().toString(),
        sender: senderName,
        text,
        timestamp: new Date().toISOString()
      };
      this.dataChannel.send(JSON.stringify(payload));
      return payload;
    }
    return null;
  }

  // Đóng kết nối P2P an toàn
  close() {
    if (this.dataChannel) {
      try { this.dataChannel.close(); } catch (e) {}
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      try { this.peerConnection.close(); } catch (e) {}
    }
  }
}
