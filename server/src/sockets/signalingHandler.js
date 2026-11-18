const { v4: uuidv4 } = require('uuid');

// Danh sách người dùng đang chờ ghép đôi ngẫu nhiên: [{ socket, user, topic }]
let waitingQueue = [];

// Danh sách người dùng bật chế độ "Chấp nhận tâm sự" (Sẵn sàng lắng nghe & trò chuyện)
// socketId -> { id, socketId, userId, anonymousName, avatar, moodTag, note, createdAt, isBot }
const activeSeekers = new Map();

// Danh sách người bạn ẩn danh mẫu (Virtual Mock Peers) để người dùng luôn có bạn trò chuyện & demo đồ án
const DEFAULT_MOCK_SEEKERS = [
  {
    id: 'seeker_mock_heli',
    socketId: 'mock_heli',
    anonymousName: 'Trợ lý AI Heli',
    avatar: '/images/avatars/avatar_star.svg',
    moodTag: 'Đồng cảm',
    moodColor: '#00bc7d',
    note: 'Trợ lý AI chính thức: Lắng nghe không phán xét, tư vấn giải tỏa stress và chăm sóc sức khỏe tinh thần 24/7.',
    createdAt: Date.now(),
    isBot: true,
  },
  {
    id: 'seeker_mock_1',
    socketId: 'mock_1',
    anonymousName: 'Họa Mi Trắng (AI)',
    avatar: '/images/avatars/avatar_bird.svg',
    moodTag: 'Áp lực',
    moodColor: '#f59e0b',
    note: 'Trợ lý AI chia sẻ áp lực: Đồng hành cùng bạn vượt qua căng thẳng đồ án tốt nghiệp, thi cử và công việc...',
    createdAt: Date.now() - 1000 * 60 * 3,
    isBot: true,
  },
  {
    id: 'seeker_mock_2',
    socketId: 'mock_2',
    anonymousName: 'Cá Voi 52Hz (AI)',
    avatar: '/images/avatars/avatar_whale.svg',
    moodTag: 'Cô đơn',
    moodColor: '#3b82f6',
    note: 'Trợ lý AI xoa dịu cô đơn: Kết nối tâm hồn đồng điệu giữa thành phố đông đúc, luôn sẵn sàng lắng nghe bạn.',
    createdAt: Date.now() - 1000 * 60 * 7,
    isBot: true,
  },
  {
    id: 'seeker_mock_3',
    socketId: 'mock_3',
    anonymousName: 'Nắng Ấm Sau Mưa (AI)',
    avatar: '/images/avatars/avatar_plant.svg',
    moodTag: 'Hy vọng',
    moodColor: '#10b981',
    note: 'Trợ lý AI năng lượng tích cực: Lan tỏa niềm tin, giải tỏa buồn phiền và tiếp thêm động lực cho ngày mới.',
    createdAt: Date.now() - 1000 * 60 * 12,
    isBot: true,
  },
  {
    id: 'seeker_mock_4',
    socketId: 'mock_4',
    anonymousName: 'Cà Phê Muối (AI)',
    avatar: '/images/avatars/avatar_coffee.svg',
    moodTag: 'Bối rối',
    moodColor: '#8b5cf6',
    note: 'Trợ lý AI tư vấn định hướng: Lắng nghe những băn khoăn về công việc, học tập và ngã rẽ cuộc sống.',
    createdAt: Date.now() - 1000 * 60 * 18,
    isBot: true,
  },
  {
    id: 'seeker_mock_5',
    socketId: 'mock_5',
    anonymousName: 'Mèo Lười Sưởi Nắng (AI)',
    avatar: '/images/avatars/avatar_cat.svg',
    moodTag: 'Mệt mỏi',
    moodColor: '#64748b',
    note: 'Trợ lý AI thư giãn & chữa lành: Không deadline, không áp lực. Một góc bình yên để bạn xả hết mệt mỏi.',
    createdAt: Date.now() - 1000 * 60 * 25,
    isBot: true,
  }
];

// Bản đồ lưu trữ thông tin phòng chat đang hoạt động: roomId -> Set of socketIds
const activeRooms = new Map();

// Bản đồ theo dõi toàn bộ Socket đang mở theo userId: userId -> Set of Sockets
const userSocketsMap = new Map();

// Helper lấy danh sách người muốn tâm sự đang khả dụng (loại trừ socket của chính người yêu cầu)
function getAvailableSeekers(excludeSocketId = null) {
  const realSeekers = [];
  for (const [sId, seeker] of activeSeekers.entries()) {
    if (sId !== excludeSocketId) {
      realSeekers.push(seeker);
    }
  }
  // Ghép danh sách người dùng thật đang chờ với danh sách mock peers
  return [...realSeekers, ...DEFAULT_MOCK_SEEKERS];
}

// Hàm chủ động ngắt toàn bộ kết nối Socket khi tài khoản bị khóa (Admin Suspend)
function disconnectUserSockets(io, userId, reason = 'Tài khoản của bạn đã bị tạm khóa do vi phạm quy định.') {
  const socketSet = userSocketsMap.get(userId);
  if (!socketSet || socketSet.size === 0) return 0;

  let count = 0;
  for (const s of socketSet) {
    try {
      // 1. Xóa khỏi hàng đợi và danh sách seeker nếu đang có
      waitingQueue = waitingQueue.filter(item => item.socket.id !== s.id);
      activeSeekers.delete(s.id);

      // 2. Rời khỏi phòng nếu đang chat
      if (s.currentRoom) {
        s.to(s.currentRoom).emit('peer-disconnected', {
          message: 'Đối phương đã bị ngắt kết nối bởi hệ thống an toàn.'
        });
        const roomSet = activeRooms.get(s.currentRoom);
        if (roomSet) {
          roomSet.delete(s.id);
          if (roomSet.size === 0) activeRooms.delete(s.currentRoom);
        }
        s.leave(s.currentRoom);
        delete s.currentRoom;
      }

      // 3. Gửi sự kiện thông báo lý do bị khóa và ép đóng socket
      s.emit('account-suspended', { reason });
      s.disconnect(true);
      count++;
    } catch (err) {
      console.error(`[Socket Force Disconnect] Lỗi ngắt socket ${s.id}:`, err.message);
    }
  }

  userSocketsMap.delete(userId);
  console.log(`[Socket Security] Đã chủ động ngắt ${count} socket của user ${userId} (Lý do: ${reason})`);
  return count;
}

function setupSignaling(io) {
  io.on('connection', (socket) => {
    const user = socket.user;
    if (!user || !user.userId) {
      socket.disconnect(true);
      return;
    }

    // Đăng ký socket vào bản đồ theo dõi người dùng
    if (!userSocketsMap.has(user.userId)) {
      userSocketsMap.set(user.userId, new Set());
    }
    userSocketsMap.get(user.userId).add(socket);

    console.log(`[Socket] Kết nối mới từ: ${user.anonymousName} (${user.userId}) [Active Sockets: ${userSocketsMap.get(user.userId).size}]`);

    // Helper kiểm tra quyền truy cập phòng trước khi cho phép chuyển tiếp signaling
    function verifyRoomMembership(roomId) {
      if (!roomId) return false;
      const roomSet = activeRooms.get(roomId);
      if (!roomSet || !roomSet.has(socket.id)) {
        console.warn(`[Security Alert] Socket ${socket.id} (${user.anonymousName}) cố can thiệp phòng trái phép: ${roomId}`);
        socket.emit('error', { message: 'Bạn không có quyền tương tác với phòng chat này.' });
        return false;
      }
      return true;
    }

    // -------------------------------------------------------------
    // CHỨC NĂNG 1: LẤY DANH SÁCH NGƯỜI MUỐN TÂM SỰ (SEEKERS LIST)
    // -------------------------------------------------------------
    socket.on('get-seekers', () => {
      const seekers = getAvailableSeekers(socket.id);
      const isMySeekerActive = activeSeekers.has(socket.id);
      const mySeekerData = activeSeekers.get(socket.id) || null;
      socket.emit('seekers-list', { seekers, isMySeekerActive, mySeekerData });
    });

    // -------------------------------------------------------------
    // CHỨC NĂNG 2: BẬT / ĐĂNG KÝ "CHẤP NHẬN TÂM SỰ" (SEEKER MODE)
    // -------------------------------------------------------------
    socket.on('register-seeker', (data = {}) => {
      const moodTag = data.moodTag || 'Lắng nghe';
      const note = data.note ? String(data.note).slice(0, 200) : 'Sẵn sàng lắng nghe mọi nỗi niềm của bạn...';
      const moodColor = data.moodColor || '#00bc7d';

      const seekerEntry = {
        id: socket.id,
        socketId: socket.id,
        userId: user.userId,
        anonymousName: user.anonymousName,
        avatar: user.avatar || '/images/avatars/avatar_whale.svg',
        moodTag,
        moodColor,
        note,
        createdAt: Date.now(),
        isBot: false
      };

      activeSeekers.set(socket.id, seekerEntry);
      console.log(`[Seeker] ${user.anonymousName} đã bật trạng thái "Chấp nhận tâm sự" (Tâm trạng: ${moodTag})`);

      socket.emit('seeker-registered', { success: true, seeker: seekerEntry });

      // Phát thông báo cập nhật danh sách người muốn tâm sự tới toàn bộ sảnh
      socket.broadcast.emit('seekers-updated', {
        seekersCount: activeSeekers.size + DEFAULT_MOCK_SEEKERS.length
      });
    });

    // Hủy đăng ký trạng thái "Chấp nhận tâm sự"
    socket.on('unregister-seeker', () => {
      if (activeSeekers.has(socket.id)) {
        activeSeekers.delete(socket.id);
        console.log(`[Seeker] ${user.anonymousName} đã tắt trạng thái "Chấp nhận tâm sự"`);
        socket.emit('seeker-unregistered', { success: true });
        socket.broadcast.emit('seekers-updated', {
          seekersCount: activeSeekers.size + DEFAULT_MOCK_SEEKERS.length
        });
      }
    });

    // -------------------------------------------------------------
    // CHỨC NĂNG 3: CHỌN NGƯỜI MUỐN TÂM SỰ (DIRECT USER SELECTION)
    // -------------------------------------------------------------
    socket.on('request-chat', ({ targetId, topic }) => {
      if (!targetId) {
        socket.emit('chat-request-rejected', { message: 'ID người nhận không hợp lệ.' });
        return;
      }

      // TRƯỜNG HỢP A: Chọn một người bạn ảo (Virtual Mock Peer)
      if (String(targetId).startsWith('seeker_mock_')) {
        const mockPeer = DEFAULT_MOCK_SEEKERS.find(s => s.id === targetId) || DEFAULT_MOCK_SEEKERS[0];
        const roomId = `room_${uuidv4()}`;

        socket.join(roomId);
        activeRooms.set(roomId, new Set([socket.id]));
        socket.currentRoom = roomId;

        // Xóa người dùng khỏi hàng đợi và danh sách seeker nếu có
        waitingQueue = waitingQueue.filter(item => item.socket.id !== socket.id);
        activeSeekers.delete(socket.id);

        console.log(`[Socket] Kết nối người dùng ${user.anonymousName} với Mock Peer: ${mockPeer.anonymousName} tại ${roomId}`);

        socket.emit('match-found', {
          roomId,
          role: 'offerer',
          peerName: mockPeer.anonymousName,
          peerAvatar: mockPeer.avatar,
          peerMood: mockPeer.moodTag,
          isMockPeer: true,
          mockId: mockPeer.id
        });
        return;
      }

      // TRƯỜNG HỢP B: Chọn người dùng thật đang online
      const targetSocket = io.sockets.sockets.get(targetId);
      if (!targetSocket || !targetSocket.connected) {
        socket.emit('chat-request-rejected', {
          message: 'Người bạn này vừa rời khỏi hoặc không còn trực tuyến. Vui lòng chọn người khác.'
        });
        return;
      }

      if (targetSocket.currentRoom) {
        socket.emit('chat-request-rejected', {
          message: 'Người bạn này hiện đang trong một cuộc trò chuyện khác. Hãy thử chọn người khác nhé!'
        });
        return;
      }

      // Gửi lời mời tâm sự tới người nhận
      targetSocket.emit('incoming-chat-request', {
        requesterSocketId: socket.id,
        requesterName: user.anonymousName,
        requesterAvatar: user.avatar || '/images/avatars/avatar_whale.svg',
        moodTag: topic || 'Tâm sự riêng tư',
        note: `Bút danh ${user.anonymousName} muốn kết nối trò chuyện cùng bạn.`
      });

      socket.emit('chat-request-pending', {
        targetName: targetSocket.user?.anonymousName || 'Người bạn ẩn danh'
      });
      console.log(`[Chat Request] ${user.anonymousName} gửi lời mời tâm sự tới ${targetSocket.user?.anonymousName}`);
    });

    // Chấp nhận lời mời tâm sự từ người khác
    socket.on('accept-chat-request', ({ requesterSocketId }) => {
      const requesterSocket = io.sockets.sockets.get(requesterSocketId);
      if (!requesterSocket || !requesterSocket.connected) {
        socket.emit('chat-request-failed', {
          message: 'Người gửi lời mời đã ngắt kết nối hoặc hủy yêu cầu.'
        });
        return;
      }

      // Tạo phòng WebRTC mới
      const roomId = `room_${uuidv4()}`;
      socket.join(roomId);
      requesterSocket.join(roomId);

      activeRooms.set(roomId, new Set([socket.id, requesterSocket.id]));
      socket.currentRoom = roomId;
      requesterSocket.currentRoom = roomId;

      // Xóa cả hai khỏi danh sách seeker và waitingQueue
      activeSeekers.delete(socket.id);
      activeSeekers.delete(requesterSocket.id);
      waitingQueue = waitingQueue.filter(item => item.socket.id !== socket.id && item.socket.id !== requesterSocket.id);

      console.log(`[Socket] Khởi tạo phòng chat thành công giữa ${requesterSocket.user.anonymousName} và ${user.anonymousName} tại ${roomId}`);

      // Gửi thông báo match-found cho cả hai bên
      requesterSocket.emit('match-found', {
        roomId,
        role: 'offerer',
        peerName: user.anonymousName,
        peerAvatar: user.avatar || '/images/avatars/avatar_whale.svg'
      });

      socket.emit('match-found', {
        roomId,
        role: 'answerer',
        peerName: requesterSocket.user.anonymousName,
        peerAvatar: requesterSocket.user.avatar || '/images/avatars/avatar_whale.svg'
      });

      // Phát thông báo cập nhật seeker list cho toàn hệ thống
      socket.broadcast.emit('seekers-updated', {
        seekersCount: activeSeekers.size + DEFAULT_MOCK_SEEKERS.length
      });
    });

    // Từ chối lời mời tâm sự
    socket.on('decline-chat-request', ({ requesterSocketId }) => {
      const requesterSocket = io.sockets.sockets.get(requesterSocketId);
      if (requesterSocket && requesterSocket.connected) {
        requesterSocket.emit('chat-request-declined', {
          message: `${user.anonymousName} hiện chưa thể nhận lời mời tâm sự. Hãy thử chọn người khác nhé!`
        });
      }
    });

    // -------------------------------------------------------------
    // CHỨC NĂNG 4: HÀNG ĐỢI GHÉP ĐÔI NGẪU NHIÊN (CLASSIC RANDOM MATCH)
    // -------------------------------------------------------------
    socket.on('join-queue', (data = {}) => {
      const topic = data.topic || 'Tất cả';

      // Xóa khỏi hàng đợi cũ nếu đã tồn tại
      waitingQueue = waitingQueue.filter(item => item.socket.id !== socket.id);

      // Nếu có người đang chờ trong hàng đợi
      if (waitingQueue.length > 0) {
        const partner = waitingQueue.shift();

        // Kiểm tra xem socket của đối phương còn kết nối không
        if (!partner.socket.connected) {
          waitingQueue.push({ socket, user, topic });
          socket.emit('queue-status', { status: 'waiting', message: 'Đang tìm kiếm người trò chuyện phù hợp...' });
          return;
        }

        // Tạo phòng chat mới
        const roomId = `room_${uuidv4()}`;
        socket.join(roomId);
        partner.socket.join(roomId);

        activeRooms.set(roomId, new Set([socket.id, partner.socket.id]));

        socket.currentRoom = roomId;
        partner.socket.currentRoom = roomId;

        activeSeekers.delete(socket.id);
        activeSeekers.delete(partner.socket.id);

        console.log(`[Socket] Ghép đôi ngẫu nhiên thành công: ${user.anonymousName} và ${partner.user.anonymousName} tại ${roomId}`);

        socket.emit('match-found', {
          roomId,
          role: 'offerer',
          peerName: partner.user.anonymousName,
          peerAvatar: partner.user.avatar || '/images/avatars/avatar_whale.svg'
        });

        partner.socket.emit('match-found', {
          roomId,
          role: 'answerer',
          peerName: user.anonymousName,
          peerAvatar: user.avatar || '/images/avatars/avatar_whale.svg'
        });
      } else {
        // Chưa có ai, thêm vào hàng đợi chờ
        waitingQueue.push({ socket, user, topic });
        socket.emit('queue-status', { status: 'waiting', message: 'Đang tìm kiếm người trò chuyện phù hợp...' });
        console.log(`[Socket] ${user.anonymousName} đã vào hàng đợi (${waitingQueue.length} người đang chờ)`);
      }
    });

    // Rời khỏi hàng đợi
    socket.on('leave-queue', () => {
      waitingQueue = waitingQueue.filter(item => item.socket.id !== socket.id);
      socket.emit('queue-status', { status: 'idle' });
      console.log(`[Socket] ${user.anonymousName} đã rời hàng đợi`);
    });

    // -------------------------------------------------------------
    // WEBRTC SIGNALING DATACHANNEL (OFFER, ANSWER, ICE)
    // -------------------------------------------------------------
    socket.on('signal-offer', ({ roomId, sdp }) => {
      if (verifyRoomMembership(roomId)) {
        socket.to(roomId).emit('signal-offer', { roomId, sdp });
      }
    });

    socket.on('signal-answer', ({ roomId, sdp }) => {
      if (verifyRoomMembership(roomId)) {
        socket.to(roomId).emit('signal-answer', { roomId, sdp });
      }
    });

    socket.on('signal-ice-candidate', ({ roomId, candidate }) => {
      if (candidate && verifyRoomMembership(roomId)) {
        socket.to(roomId).emit('signal-ice-candidate', { roomId, candidate });
      }
    });

    // Rời khỏi phòng chat 1-1
    socket.on('leave-room', () => {
      handleLeaveRoom(socket);
    });

    // Xử lý khi ngắt kết nối
    socket.on('disconnect', () => {
      console.log(`[Socket] Ngắt kết nối: ${user.anonymousName}`);
      waitingQueue = waitingQueue.filter(item => item.socket.id !== socket.id);
      
      const wasSeeker = activeSeekers.has(socket.id);
      activeSeekers.delete(socket.id);
      if (wasSeeker) {
        socket.broadcast.emit('seekers-updated', {
          seekersCount: activeSeekers.size + DEFAULT_MOCK_SEEKERS.length
        });
      }

      handleLeaveRoom(socket);

      // Dọn dẹp bản đồ theo dõi socket
      const userSockets = userSocketsMap.get(user.userId);
      if (userSockets) {
        userSockets.delete(socket);
        if (userSockets.size === 0) {
          userSocketsMap.delete(user.userId);
        }
      }
    });

    function handleLeaveRoom(currSocket) {
      const roomId = currSocket.currentRoom;
      if (roomId) {
        currSocket.to(roomId).emit('peer-disconnected', {
          message: 'Đối phương đã rời khỏi cuộc trò chuyện.'
        });
        currSocket.leave(roomId);
        delete currSocket.currentRoom;

        const roomSet = activeRooms.get(roomId);
        if (roomSet) {
          roomSet.delete(currSocket.id);
          if (roomSet.size === 0) {
            activeRooms.delete(roomId);
          }
        }
      }
    }
  });
}

module.exports = {
  setupSignaling,
  disconnectUserSockets
};
