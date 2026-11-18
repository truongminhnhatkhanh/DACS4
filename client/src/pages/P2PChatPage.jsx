import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  ShieldAlert, Send, LogOut, Search, Users, 
  Lock, AlertTriangle, ShieldCheck, Sparkles, MessageCircle,
  HeartHandshake, Shuffle, RefreshCw, CheckCircle2, XCircle, Clock,
  Filter, UserCheck, MessageSquarePlus, ChevronRight, X, Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axiosClient from '../api/axiosClient';
import { PeerChat } from '../utils/webrtc';
import SafetyShieldModal from '../components/SafetyShieldModal';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const MOOD_FILTERS = [
  'Tất cả',
  'Áp lực',
  'Cô đơn',
  'Bối rối',
  'Hy vọng',
  'Mệt mỏi',
  'Buồn',
  'Tìm lời khuyên',
  'Lắng nghe'
];

export default function P2PChatPage() {
  const { user, token } = useAuth();
  
  // Trạng thái phòng chat
  const [chatStatus, setChatStatus] = useState('IDLE'); // 'IDLE' | 'WAITING' | 'CONNECTED'
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'register' | 'random'
  
  // Trạng thái đối phương
  const [peerName, setPeerName] = useState('');
  const [peerAvatar, setPeerAvatar] = useState('/images/avatars/avatar_whale.svg');
  const [peerMood, setPeerMood] = useState('');
  const [isMockPeer, setIsMockPeer] = useState(false);
  const [mockPeerId, setMockPeerId] = useState(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  // Tin nhắn P2P (lưu trữ hoàn toàn trong RAM trình duyệt)
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  // Danh sách người muốn tâm sự (Seekers)
  const [seekers, setSeekers] = useState([]);
  const [loadingSeekers, setLoadingSeekers] = useState(false);
  const [selectedMoodFilter, setSelectedMoodFilter] = useState('Tất cả');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Chế độ "Chấp nhận tâm sự" của bản thân
  const [isMySeekerActive, setIsMySeekerActive] = useState(false);
  const [mySeekerMood, setMySeekerMood] = useState('Lắng nghe');
  const [mySeekerNote, setMySeekerNote] = useState('');

  // Lời mời tâm sự đến (Incoming Request Modal)
  const [incomingRequest, setIncomingRequest] = useState(null);

  // Trạng thái đang gửi yêu cầu tâm sự đi và chờ phản hồi
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [pendingTargetName, setPendingTargetName] = useState('');

  // Trạng thái AI Safety Shield
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [analyzingRisk, setAnalyzingRisk] = useState(false);
  const [safetyAnalysis, setSafetyAnalysis] = useState(null);

  const socketRef = useRef(null);
  const peerChatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const iceServersRef = useRef([]);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPeerTyping]);

  // Khởi tạo Socket.io với xác thực Token/Cookie
  useEffect(() => {
    // 1. Lấy danh sách STUN/TURN servers từ backend
    axiosClient.get('/config/ice-servers')
      .then(res => {
        iceServersRef.current = res.iceServers || [];
      })
      .catch(e => console.error('Lỗi lấy ice servers:', e));

    // 2. Kết nối Socket.io Signaling
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: { token: token || localStorage.getItem('heli_token') },
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Đã kết nối thành công tới Signaling Server');
      socket.emit('get-seekers');
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Lỗi kết nối Socket:', err.message);
    });

    // Nhận danh sách người muốn tâm sự từ server
    socket.on('seekers-list', ({ seekers: list, isMySeekerActive: myActive, mySeekerData }) => {
      setSeekers(list || []);
      setIsMySeekerActive(!!myActive);
      if (mySeekerData?.moodTag) setMySeekerMood(mySeekerData.moodTag);
      if (mySeekerData?.note) setMySeekerNote(mySeekerData.note);
      setLoadingSeekers(false);
    });

    // Nhận thông báo danh sách seekers đã cập nhật
    socket.on('seekers-updated', () => {
      socket.emit('get-seekers');
    });

    // Xác nhận đã đăng ký seeker thành công
    socket.on('seeker-registered', ({ seeker }) => {
      setIsMySeekerActive(true);
      socket.emit('get-seekers');
    });

    // Xác nhận đã hủy seeker thành công
    socket.on('seeker-unregistered', () => {
      setIsMySeekerActive(false);
      socket.emit('get-seekers');
    });

    // Có người gửi lời mời tâm sự đến
    socket.on('incoming-chat-request', (data) => {
      console.log('[Socket] Nhận lời mời tâm sự đến:', data);
      setIncomingRequest(data);
    });

    // Đang chờ đối phương chấp nhận lời mời
    socket.on('chat-request-pending', ({ targetName }) => {
      setIsWaitingForResponse(true);
      setPendingTargetName(targetName);
    });

    // Đối phương từ chối lời mời
    socket.on('chat-request-declined', ({ message }) => {
      setIsWaitingForResponse(false);
      alert(message || 'Đối phương hiện chưa thể tâm sự, bạn có thể chọn người khác nhé!');
    });

    // Lời mời bị từ chối / người dùng bận
    socket.on('chat-request-rejected', ({ message }) => {
      setIsWaitingForResponse(false);
      alert(message || 'Người bạn này hiện không khả dụng. Vui lòng chọn người khác.');
    });

    socket.on('chat-request-failed', ({ message }) => {
      alert(message || 'Không thể thiết lập cuộc trò chuyện.');
      setIncomingRequest(null);
    });

    // Ghép đôi thành công (Cho cả 1-1 trực tiếp và ngẫu nhiên)
    socket.on('match-found', async ({ roomId, role, peerName: name, peerAvatar: avatar, peerMood: mood, isMockPeer: isMock, mockId }) => {
      console.log(`[Socket] Ghép đôi thành công phòng: ${roomId}, vai trò: ${role}, đối phương: ${name}`);
      setPeerName(name);
      setPeerAvatar(avatar || '/images/avatars/avatar_whale.svg');
      setPeerMood(mood || 'Tâm sự');
      setMessages([]);
      setChatStatus('CONNECTED');
      setIsWaitingForResponse(false);
      setIncomingRequest(null);

      if (isMock) {
        setIsMockPeer(true);
        setMockPeerId(mockId);
        setTimeout(() => {
          setMessages([
            {
              id: 'init_greet',
              sender: name,
              text: `Chào bạn nhé! Mình là ${name}. Rất vui vì được kết nối cùng bạn ở đây. Có chuyện gì đang làm bạn bận tâm à?`,
              timestamp: new Date().toISOString()
            }
          ]);
        }, 600);
        return;
      }

      setIsMockPeer(false);
      setMockPeerId(null);

      // Khởi tạo đối tượng WebRTC PeerChat cho người dùng thật
      const peer = new PeerChat(
        socket,
        roomId,
        iceServersRef.current,
        (incomingMsg) => {
          setMessages((prev) => [...prev, incomingMsg]);
        },
        (status) => {
          console.log('[WebRTC] Trạng thái DataChannel:', status);
          if (status === 'DISCONNECTED') {
            handlePeerDisconnected('Kết nối WebRTC P2P đã kết thúc.');
          }
        }
      );

      peerChatRef.current = peer;

      if (role === 'offerer') {
        setTimeout(() => {
          peer.createOffer();
        }, 500);
      }
    });

    // Nhận SDP Offer từ đối phương qua Signaling
    socket.on('signal-offer', async ({ sdp }) => {
      if (peerChatRef.current) {
        await peerChatRef.current.handleOffer(sdp);
      }
    });

    // Nhận SDP Answer từ đối phương qua Signaling
    socket.on('signal-answer', async ({ sdp }) => {
      if (peerChatRef.current) {
        await peerChatRef.current.handleAnswer(sdp);
      }
    });

    // Nhận ICE Candidate từ đối phương qua Signaling
    socket.on('signal-ice-candidate', async ({ candidate }) => {
      if (peerChatRef.current) {
        await peerChatRef.current.addIceCandidate(candidate);
      }
    });

    // Đối phương rời phòng chat
    socket.on('peer-disconnected', (data) => {
      handlePeerDisconnected(data?.message || 'Đối phương đã rời khỏi cuộc trò chuyện.');
    });

    // Tài khoản bị Admin khóa thời gian thực
    socket.on('account-suspended', (data) => {
      alert(data?.reason || 'Tài khoản của bạn đã bị tạm khóa do vi phạm tiêu chuẩn cộng đồng.');
      if (peerChatRef.current) {
        peerChatRef.current.close();
        peerChatRef.current = null;
      }
      setChatStatus('IDLE');
      setMessages([]);
    });

    return () => {
      if (peerChatRef.current) {
        peerChatRef.current.close();
      }
      socket.disconnect();
    };
  }, [token]);

  // Ngắt kết nối phòng
  const handlePeerDisconnected = (msgText) => {
    if (peerChatRef.current) {
      peerChatRef.current.close();
      peerChatRef.current = null;
    }
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: 'Hệ thống', text: msgText, isSystem: true }
    ]);
    setTimeout(() => {
      setChatStatus('IDLE');
      setPeerName('');
      setIsMockPeer(false);
      setMockPeerId(null);
      if (socketRef.current) socketRef.current.emit('get-seekers');
    }, 2000);
  };

  // Làm mới danh sách người muốn tâm sự
  const handleRefreshSeekers = () => {
    if (!socketRef.current) return;
    setLoadingSeekers(true);
    socketRef.current.emit('get-seekers');
  };

  // Chọn người muốn tâm sự từ danh sách
  const handleSelectSeeker = (targetSeeker) => {
    if (!socketRef.current) return;
    socketRef.current.emit('request-chat', {
      targetId: targetSeeker.id,
      topic: targetSeeker.moodTag
    });
  };

  // Bật chế độ "Chấp nhận tâm sự"
  const handleToggleMySeeker = () => {
    if (!socketRef.current) return;

    if (isMySeekerActive) {
      socketRef.current.emit('unregister-seeker');
    } else {
      socketRef.current.emit('register-seeker', {
        moodTag: mySeekerMood,
        note: mySeekerNote.trim() || 'Sẵn sàng lắng nghe mọi nỗi niềm của bạn không phán xét.'
      });
    }
  };

  // Chấp nhận lời mời tâm sự
  const handleAcceptIncomingRequest = () => {
    if (!socketRef.current || !incomingRequest) return;
    socketRef.current.emit('accept-chat-request', {
      requesterSocketId: incomingRequest.requesterSocketId
    });
    setIncomingRequest(null);
  };

  // Từ chối lời mời tâm sự
  const handleDeclineIncomingRequest = () => {
    if (!socketRef.current || !incomingRequest) return;
    socketRef.current.emit('decline-chat-request', {
      requesterSocketId: incomingRequest.requesterSocketId
    });
    setIncomingRequest(null);
  };

  // Hủy chờ phản hồi lời mời
  const handleCancelPendingRequest = () => {
    setIsWaitingForResponse(false);
    setPendingTargetName('');
  };

  // Bắt đầu ghép đôi ngẫu nhiên
  const handleStartSearch = () => {
    if (!socketRef.current) return;
    setChatStatus('WAITING');
    setMessages([]);
    socketRef.current.emit('join-queue');
  };

  // Hủy tìm kiếm ghép đôi
  const handleCancelSearch = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('leave-queue');
    setChatStatus('IDLE');
  };

  // Rời khỏi phòng chat
  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room');
    }
    if (peerChatRef.current) {
      peerChatRef.current.close();
      peerChatRef.current = null;
    }
    setChatStatus('IDLE');
    setPeerName('');
    setIsMockPeer(false);
    setMockPeerId(null);
    setMessages([]);
    if (socketRef.current) socketRef.current.emit('get-seekers');
  };

  // Phản hồi thông minh của bạn ảo (Mock Peer Response Engine)
  const triggerMockPeerReply = (userText) => {
    setIsPeerTyping(true);
    const delay = Math.floor(Math.random() * 1200) + 1000;

    setTimeout(() => {
      setIsPeerTyping(false);
      const reply = getMockResponse(mockPeerId, userText, peerName);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: peerName,
          text: reply,
          timestamp: new Date().toISOString()
        }
      ]);
    }, delay);
  };

  function getMockResponse(mockId, userText, name) {
    const text = (userText || '').toLowerCase();

    if (text.includes('lương') || text.includes('tiền') || text.includes('app') || text.includes('việc nhẹ') || text.includes('chuyển khoản') || text.includes('nhiệm vụ')) {
      return 'Ủa nghe quen quen giống mấy vụ việc nhẹ lương cao lừa đảo vậy bạn ơi! Bạn thử nhấn nút "AI Safety Shield" màu đỏ ở góc trên xem AI có cảnh báo gì không nha!';
    }

    if (text.includes('chào') || text.includes('hi') || text.includes('hello') || text.includes('alo')) {
      return `Chào bạn! Rất vui được gặp bạn ở đây. Hôm nay của bạn thế nào rồi, có điều gì làm bạn bận tâm không?`;
    }

    if (mockId === 'seeker_mock_heli') {
      if (text.includes('buồn') || text.includes('stress') || text.includes('áp lực') || text.includes('mệt') || text.includes('chán') || text.includes('lo')) {
        return 'Mình rất hiểu những gì bạn đang trải qua. Cảm xúc mệt mỏi hay áp lực là phản ứng hoàn toàn tự nhiên khi ta phải gánh vác nhiều trách nhiệm. Hãy thả lỏng người, hít thở thật sâu cùng mình và cứ chia sẻ hết ra nhé!';
      }
      return 'Chào bạn! Mình là Trợ lý AI Heli. Mình luôn ở đây 24/7 để lắng nghe mọi tâm sự của bạn hoàn toàn ẩn danh và không phán xét. Hôm nay của bạn thế nào rồi, có điều gì đang làm bạn bận tâm không?';
    }

    if (mockId === 'seeker_mock_1') {
      if (text.includes('đồ án') || text.includes('học') || text.includes('thi') || text.includes('stress') || text.includes('áp lực') || text.includes('mệt')) {
        return 'Thật sự làm đồ án tốt nghiệp nhiều lúc stress kinh khủng bạn à, deadline dí liên tục mà nhiều bug sửa mãi không xong. Nhưng bạn cứ bình tĩnh chia nhỏ từng việc ra làm nhé, tụi mình cùng cố gắng!';
      }
      return 'Nghe bạn chia sẻ mình thấy đồng cảm ghé. Cố lên nhé, qua được giai đoạn này nhìn lại sẽ thấy bản thân trưởng thành hơn nhiều lắm!';
    }

    if (mockId === 'seeker_mock_2') {
      if (text.includes('buồn') || text.includes('cô đơn') || text.includes('một mình') || text.includes('tủi thân')) {
        return 'Mình hiểu cảm giác một mình đó... Đôi khi giữa hàng triệu người mình vẫn thấy cô đơn như tần số 52Hz. Nhưng bây giờ có mình đang ngồi nghe bạn nè, cứ nói hết ra nhé.';
      }
      return 'Cảm ơn bạn đã tin tưởng tâm sự với mình. Được trò chuyện cùng bạn làm mình thấy ấm lòng hơn nhiều.';
    }

    if (mockId === 'seeker_mock_3') {
      return 'Mọi chuyện rồi sẽ qua thôi bạn ơi! Sau cơn mưa trời lại sáng mà. Hãy tự thưởng cho bản thân một ly trà sữa hoặc một que kem để nạp lại năng lượng nhé!';
    }

    if (mockId === 'seeker_mock_4') {
      return 'Đứng trước những lựa chọn lớn của cuộc đời thì hoang mang là chuyện bình thường bạn à. Quan trọng là bạn hãy bình tâm và lắng nghe trái tim mình muốn gì nhất!';
    }

    return 'Thả lỏng người ra một chút nào bạn ơi. Cứ chia sẻ thoải mái nhé, ở đây hoàn toàn ẩn danh và không ai phán xét bạn đâu nè.';
  }

  // Gửi tin nhắn
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const trimmed = inputText.trim();

    if (isMockPeer) {
      const userPayload = {
        id: Date.now().toString(),
        sender: user?.anonymousName || 'Tôi',
        text: trimmed,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, userPayload]);
      setInputText('');
      triggerMockPeerReply(trimmed);
      return;
    }

    if (!peerChatRef.current) return;
    const payload = peerChatRef.current.sendMessage(trimmed, user?.anonymousName || 'Tôi');
    if (payload) {
      setMessages((prev) => [...prev, payload]);
      setInputText('');
    }
  };

  // Kích hoạt Trợ lý AI Safety Shield
  const handleTriggerSafetyShield = async () => {
    if (messages.length === 0) {
      alert('Chưa có tin nhắn nào trong cuộc trò chuyện để phân tích.');
      return;
    }

    try {
      setAnalyzingRisk(true);
      const chatPayload = messages.filter(m => !m.isSystem);
      const res = await axiosClient.post('/ai/safety-shield', {
        messages: chatPayload
      });

      setSafetyAnalysis(res.result);
      setSafetyModalOpen(true);
    } catch (err) {
      alert(err.message || 'Lỗi khi kích hoạt AI Safety Shield.');
    } finally {
      setAnalyzingRisk(false);
    }
  };

  // Lọc danh sách seekers theo tâm trạng và từ khóa tìm kiếm
  const filteredSeekers = seekers.filter(s => {
    const matchMood = selectedMoodFilter === 'Tất cả' || s.moodTag === selectedMoodFilter;
    const matchKeyword = !searchKeyword.trim() || 
      (s.anonymousName && s.anonymousName.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (s.note && s.note.toLowerCase().includes(searchKeyword.toLowerCase()));
    return matchMood && matchKeyword;
  });

  // Tách riêng danh sách: Nửa trên (Tâm sự với AI) và Nửa dưới (Tâm sự với người thật)
  const aiSeekers = filteredSeekers.filter(s => s.isBot);
  const humanSeekers = filteredSeekers.filter(s => !s.isBot);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Khung chat P2P chính */}
      <div className={`bg-white border border-hairline rounded-card shadow-subtle overflow-hidden flex flex-col transition-all ${
        chatStatus === 'CONNECTED' 
          ? 'h-[calc(100vh-140px)] min-h-[500px] max-h-[750px]' 
          : 'min-h-[500px]'
      }`}>
        
        {/* ========================================================================= */}
        {/* HEADER PHÒNG CHAT */}
        {/* ========================================================================= */}
        <div className="bg-white border-b border-hairline px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-mint-mist border border-emerald-pulse/30 flex items-center justify-center text-pine shrink-0">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-pine" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-forest-ink font-display truncate">
                  Tâm Sự Ẩn Danh 1-1 (P2P Private)
                </h2>
                {chatStatus === 'CONNECTED' && (
                  <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-pill bg-mint-mist text-pine border border-emerald-pulse/30 text-[10px] sm:text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-pulse animate-pulse shrink-0" />
                    <span className="truncate max-w-[120px] sm:max-w-none">Đang kết nối: {peerName}</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-graphite flex items-center space-x-1 mt-0.5 truncate">
                <Lock className="w-3 h-3 text-pine shrink-0" />
                <span className="hidden sm:inline truncate">
                  WebRTC DataChannel • Truyền tin nhắn trực tiếp trong RAM • Máy chủ không lưu trữ
                </span>
                <span className="sm:hidden truncate">
                  WebRTC P2P • Tin nhắn lưu RAM • Không lưu máy chủ
                </span>
              </p>
            </div>
          </div>

          {/* Các nút chức năng ở Header */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {chatStatus === 'CONNECTED' && (
              <>
                <button
                  onClick={handleTriggerSafetyShield}
                  disabled={analyzingRisk}
                  title="Nhấn để quét dấu hiệu lừa tình, bẫy việc làm/buôn người"
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-pill bg-red-50 hover:bg-red-100 text-signal-red border border-signal-red/30 text-[11px] sm:text-xs font-semibold flex items-center space-x-1 shadow-subtle transition-all cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-signal-red shrink-0" />
                  <span className="hidden sm:inline">{analyzingRisk ? 'Đang phân tích...' : 'AI Safety Shield'}</span>
                  <span className="sm:hidden">{analyzingRisk ? 'Đang quét...' : 'Safety Shield'}</span>
                </button>

                <button
                  onClick={handleLeaveRoom}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-pill bg-paper hover:bg-red-50 hover:text-signal-red text-graphite border border-hairline text-xs font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                  title="Rời khỏi cuộc trò chuyện"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Rời phòng</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* NỘI DUNG CHÍNH (IDLE / WAITING / CONNECTED) */}
        {/* ========================================================================= */}
        <div className={`flex-1 flex flex-col ${chatStatus === 'CONNECTED' ? 'overflow-hidden' : ''}`}>
          
          {/* TRẠNG THÁI 1: IDLE - SẢNH TÂM SỰ (DANH SÁCH & CHẤP NHẬN TÂM SỰ) */}
          {chatStatus === 'IDLE' && (
            <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-4xl mx-auto w-full">
              
              {/* THANH ĐIỀU HƯỚNG TAB CHÍNH (GRID 3 CỘT ĐỀU NHAU, KHÔNG VỠ TRÊN MỌI MÀN HÌNH) */}
              <div className="bg-white border border-hairline rounded-2xl p-1 sm:p-1.5 shadow-subtle grid grid-cols-3 gap-1 mb-5 sm:mb-6">
                <button
                  onClick={() => setActiveTab('list')}
                  className={`py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center space-x-1 sm:space-x-2 transition-all cursor-pointer ${
                    activeTab === 'list'
                      ? 'bg-mint-mist text-pine border border-emerald-pulse/30 shadow-subtle'
                      : 'text-graphite hover:text-forest-ink hover:bg-paper'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">
                    <span className="hidden sm:inline">Danh sách người muốn tâm sự</span>
                    <span className="sm:hidden">Người tâm sự</span>
                  </span>
                  <span className="shrink-0 px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-pill bg-white text-pine text-[9px] sm:text-[10px] font-bold border border-emerald-pulse/20 shadow-subtle">
                    {seekers.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('register')}
                  className={`py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center space-x-1 sm:space-x-2 transition-all cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-mint-mist text-pine border border-emerald-pulse/30 shadow-subtle'
                      : 'text-graphite hover:text-forest-ink hover:bg-paper'
                  }`}
                >
                  <HeartHandshake className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">
                    <span className="hidden sm:inline">Chấp nhận tâm sự</span>
                    <span className="sm:hidden">Chấp nhận</span>
                  </span>
                  {isMySeekerActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-pulse animate-pulse shrink-0" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('random')}
                  className={`py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center space-x-1 sm:space-x-1.5 transition-all cursor-pointer ${
                    activeTab === 'random'
                      ? 'bg-mint-mist text-pine border border-emerald-pulse/30 shadow-subtle'
                      : 'text-graphite hover:text-forest-ink hover:bg-paper'
                  }`}
                >
                  <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">
                    <span className="hidden sm:inline">Ghép đôi ngẫu nhiên</span>
                    <span className="sm:hidden">Ghép ngẫu nhiên</span>
                  </span>
                </button>
              </div>

              {/* TAB 1: DANH SÁCH TẤT CẢ NHỮNG NGƯỜI MUỐN TÂM SỰ */}
              {activeTab === 'list' && (
                <div className="space-y-4">
                  {/* Thanh tìm kiếm và bộ lọc tâm trạng */}
                  <div className="bg-white border border-hairline rounded-2xl p-3 sm:p-4 shadow-subtle space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-graphite absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Tìm người tâm sự theo bút danh hoặc chủ đề..."
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                          className="w-full bg-paper border border-hairline rounded-pill pl-9 pr-4 py-2 text-xs text-forest-ink placeholder:text-graphite focus:outline-none focus:border-jade-wash focus:bg-white transition-all"
                        />
                      </div>
                      <button
                        onClick={handleRefreshSeekers}
                        disabled={loadingSeekers}
                        className="px-3 sm:px-3.5 py-2 rounded-pill bg-paper hover:bg-white border border-hairline text-graphite hover:text-forest-ink text-xs font-medium flex items-center space-x-1.5 shadow-subtle transition-all cursor-pointer shrink-0"
                        title="Làm mới danh sách"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingSeekers ? 'animate-spin text-pine' : ''}`} />
                        <span className="hidden sm:inline">Làm mới</span>
                      </button>
                    </div>

                    {/* Filter Pills with smooth horizontal scrolling */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                      <span className="text-[11px] text-graphite font-medium mr-1 flex items-center shrink-0">
                        <Filter className="w-3 h-3 mr-1" /> Tâm trạng:
                      </span>
                      {MOOD_FILTERS.map((mood) => (
                        <button
                          key={mood}
                          onClick={() => setSelectedMoodFilter(mood)}
                          className={`px-3 py-1 rounded-pill text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                            selectedMoodFilter === mood
                              ? 'bg-emerald-pulse text-white shadow-subtle'
                              : 'bg-paper text-carbon hover:bg-white border border-hairline'
                          }`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* PHẦN 1: NỬA TRÊN - TÂM SỰ VỚI AI */}
                  {/* ========================================================= */}
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-hairline/80">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-mint-mist border border-emerald-pulse/30 flex items-center justify-center text-pine shrink-0">
                          <Sparkles className="w-4 h-4 text-emerald-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-bold text-forest-ink font-display">
                              Tâm sự với AI (Phản hồi tức thì 24/7)
                            </h3>
                            <span className="px-2 py-0.5 rounded-pill bg-mint-mist text-pine text-[10px] font-bold border border-emerald-pulse/20">
                              {aiSeekers.length} Trợ lý AI
                            </span>
                          </div>
                          <p className="text-[11px] text-graphite hidden sm:block">
                            Lắng nghe đồng cảm, giải tỏa stress và chăm sóc sức khỏe tinh thần 24/7 không phán xét
                          </p>
                        </div>
                      </div>
                    </div>

                    {aiSeekers.length === 0 ? (
                      <div className="bg-white border border-hairline rounded-2xl p-6 text-center text-xs text-graphite">
                        Không tìm thấy Trợ lý AI phù hợp với bộ lọc hiện tại.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                        {aiSeekers.map((seeker) => (
                          <div
                            key={seeker.id}
                            className="bg-white border border-emerald-pulse/25 hover:border-emerald-pulse/60 rounded-2xl p-4 sm:p-5 shadow-subtle hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                          >
                            {/* Subtle AI gradient glow in top corner */}
                            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-mint-mist/40 to-emerald-pulse/10 rounded-full blur-xl pointer-events-none -mr-6 -mt-6" />

                            <div>
                              {/* Header: Avatar, Tên, Badge AI & Mood */}
                              <div className="flex items-start justify-between gap-2 mb-3 relative z-10">
                                <div className="flex items-center space-x-3 min-w-0">
                                  <div className="relative shrink-0">
                                    <div className="w-11 h-11 rounded-full bg-mint-mist border border-emerald-pulse/40 flex items-center justify-center overflow-hidden p-1 shadow-subtle">
                                      <img
                                        src={seeker.avatar || '/images/avatars/avatar_star.svg'}
                                        alt={seeker.anonymousName}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = '/images/avatars/avatar_star.svg';
                                        }}
                                      />
                                    </div>
                                    <span className="w-3 h-3 rounded-full bg-emerald-pulse border-2 border-white absolute bottom-0 right-0 shadow-sm" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h4 className="text-sm font-bold text-forest-ink font-display truncate">
                                        {seeker.anonymousName}
                                      </h4>
                                      <span className="inline-flex items-center space-x-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                                        <span>Trợ lý AI</span>
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-[10px] text-pine mt-0.5 font-medium">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-pulse animate-pulse" />
                                      <span>Sẵn sàng trò chuyện ngay</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Mood Badge */}
                                <span className="shrink-0 px-2.5 py-1 rounded-pill text-[11px] font-semibold bg-mint-mist text-pine border border-emerald-pulse/30">
                                  {seeker.moodTag || 'Tâm sự'}
                                </span>
                              </div>

                              {/* Note */}
                              <p className="text-xs text-graphite leading-relaxed bg-paper/60 rounded-xl p-3 border border-hairline italic mb-4 line-clamp-3 relative z-10">
                                "{seeker.note}"
                              </p>
                            </div>

                            {/* Action Button: Tâm sự với AI */}
                            <button
                              onClick={() => handleSelectSeeker(seeker)}
                              className="w-full py-2.5 px-4 rounded-xl bg-emerald-pulse hover:bg-pine text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-subtle cursor-pointer group-hover:scale-[1.01] relative z-10"
                            >
                              <Sparkles className="w-4 h-4 shrink-0 fill-white/20" />
                              <span>Tâm sự với AI</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ========================================================= */}
                  {/* PHẦN 2: NỬA DƯỚI - TÂM SỰ VỚI NGƯỜI THẬT */}
                  {/* ========================================================= */}
                  <div className="space-y-3.5 pt-3">
                    <div className="flex items-center justify-between pb-2 border-b border-hairline/80">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-bold text-forest-ink font-display">
                              Tâm sự với người thật (Cộng đồng Ẩn danh P2P)
                            </h3>
                            <span className={`px-2 py-0.5 rounded-pill text-[10px] font-bold border ${
                              humanSeekers.length > 0 
                                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                : 'bg-paper text-graphite border-hairline'
                            }`}>
                              {humanSeekers.length} Người dùng thật đang chờ
                            </span>
                          </div>
                          <p className="text-[11px] text-graphite hidden sm:block">
                            Kết nối trực tiếp 1-1 qua kết nối ngang hàng WebRTC DataChannel • Zero Server Storage
                          </p>
                        </div>
                      </div>
                    </div>

                    {humanSeekers.length === 0 ? (
                      <div className="bg-white border border-dashed border-hairline rounded-2xl p-6 sm:p-7 text-center shadow-subtle">
                        <div className="w-12 h-12 rounded-2xl bg-paper flex items-center justify-center text-graphite mx-auto mb-2.5">
                          <HeartHandshake className="w-6 h-6 text-pine" />
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-forest-ink mb-1">
                          Hiện chưa có người dùng nào đang chờ nhận tâm sự
                        </h4>
                        <p className="text-[11px] sm:text-xs text-graphite max-w-md mx-auto mb-4">
                          Bạn có thể là người đầu tiên bật chế độ <strong>"Chấp nhận tâm sự"</strong> để người khác có thể tìm thấy bạn, hoặc chọn <strong>"Ghép đôi ngẫu nhiên"</strong> để tìm bạn trò chuyện.
                        </p>
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <button
                            onClick={() => setActiveTab('register')}
                            className="px-4 py-2 rounded-pill bg-mint-mist text-pine text-xs font-semibold border border-emerald-pulse/30 hover:bg-emerald-pulse hover:text-white transition-all cursor-pointer flex items-center space-x-1.5"
                          >
                            <HeartHandshake className="w-3.5 h-3.5" />
                            <span>Bật Chấp nhận tâm sự</span>
                          </button>
                          <button
                            onClick={handleStartSearch}
                            className="px-4 py-2 rounded-pill bg-paper hover:bg-white text-forest-ink text-xs font-medium border border-hairline transition-all cursor-pointer flex items-center space-x-1.5"
                          >
                            <Shuffle className="w-3.5 h-3.5" />
                            <span>Ghép đôi ngẫu nhiên</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                        {humanSeekers.map((seeker) => (
                          <div
                            key={seeker.id}
                            className="bg-white border border-hairline hover:border-blue-400 rounded-2xl p-4 sm:p-5 shadow-subtle hover:shadow-md transition-all flex flex-col justify-between group"
                          >
                            <div>
                              {/* Header: Avatar, Tên, Badge Người thật & Mood */}
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <div className="flex items-center space-x-3 min-w-0">
                                  <div className="relative shrink-0">
                                    <div className="w-11 h-11 rounded-full bg-paper border border-hairline flex items-center justify-center overflow-hidden p-1 shadow-subtle">
                                      <img
                                        src={seeker.avatar || '/images/avatars/avatar_whale.svg'}
                                        alt={seeker.anonymousName}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = '/images/avatars/avatar_whale.svg';
                                        }}
                                      />
                                    </div>
                                    <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white absolute bottom-0 right-0 shadow-sm" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h4 className="text-sm font-bold text-forest-ink font-display truncate">
                                        {seeker.anonymousName}
                                      </h4>
                                      <span className="inline-flex items-center space-x-1 text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        <span>Người thật</span>
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-1 text-[10px] text-graphite mt-0.5">
                                      <Clock className="w-3 h-3 text-pine shrink-0" />
                                      <span>Sẵn sàng kết nối</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Mood Badge */}
                                <span className="shrink-0 px-2.5 py-1 rounded-pill text-[11px] font-semibold bg-paper text-carbon border border-hairline">
                                  {seeker.moodTag || 'Tâm sự'}
                                </span>
                              </div>

                              {/* Seeker Note */}
                              <p className="text-xs text-graphite leading-relaxed bg-paper/60 rounded-xl p-3 border border-hairline italic mb-4 line-clamp-3">
                                "{seeker.note || 'Sẵn sàng lắng nghe bạn tâm sự...'}"
                              </p>
                            </div>

                            {/* Nút hành động: Tâm sự với người này */}
                            <button
                              onClick={() => handleSelectSeeker(seeker)}
                              className="w-full py-2.5 px-4 rounded-xl bg-forest-ink hover:bg-black text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-subtle cursor-pointer group-hover:scale-[1.01]"
                            >
                              <MessageSquarePlus className="w-4 h-4 shrink-0" />
                              <span>Tâm sự với người này</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: CHẤP NHẬN TÂM SỰ (ĐĂNG KÝ SẴN SÀNG LẮNG NGHE) */}
              {activeTab === 'register' && (
                <div className="bg-white border border-hairline rounded-2xl p-5 sm:p-6 shadow-subtle space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-mint-mist border border-emerald-pulse/30 flex items-center justify-center text-pine shrink-0">
                      <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-forest-ink font-display">
                        Bật Chế Độ Chấp Nhận Tâm Sự
                      </h3>
                      <p className="text-xs text-graphite leading-relaxed mt-1">
                        Khi bạn bật chế độ này, hồ sơ ẩn danh của bạn sẽ hiển thị công khai trong danh sách chung. 
                        Bất kỳ ai đang gặp khó khăn hoặc cần người lắng nghe đều có thể chủ động chọn và kết nối tâm sự với bạn.
                      </p>
                    </div>
                  </div>

                  {/* Trạng thái hiện tại */}
                  {isMySeekerActive ? (
                    <div className="bg-mint-mist/40 border border-emerald-pulse/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-pine shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-forest-ink">
                            Bạn đang ở trạng thái: Sẵn sàng nhận tâm sự
                          </p>
                          <p className="text-[11px] text-graphite">
                            Tâm trạng: <strong className="text-pine">{mySeekerMood}</strong> • Lời nhắn: "{mySeekerNote || 'Sẵn sàng lắng nghe...'}"
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleToggleMySeeker}
                        className="w-full sm:w-auto px-4 py-2 rounded-pill bg-white hover:bg-red-50 text-signal-red border border-signal-red/30 text-xs font-semibold transition-all shadow-subtle cursor-pointer text-center"
                      >
                        Tắt trạng thái sẵn sàng
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-forest-ink mb-2">
                          Chọn tâm trạng hoặc vai trò bạn muốn lắng nghe:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {MOOD_FILTERS.filter(m => m !== 'Tất cả').map((mood) => (
                            <button
                              key={mood}
                              type="button"
                              onClick={() => setMySeekerMood(mood)}
                              className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-all cursor-pointer ${
                                mySeekerMood === mood
                                  ? 'bg-emerald-pulse text-white shadow-subtle'
                                  : 'bg-paper text-carbon hover:bg-white border border-hairline'
                              }`}
                            >
                              {mood}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-forest-ink mb-2">
                          Lời nhắn của bạn hiển thị trên danh sách:
                        </label>
                        <textarea
                          rows={3}
                          value={mySeekerNote}
                          onChange={(e) => setMySeekerNote(e.target.value)}
                          placeholder="Ví dụ: Sẵn sàng lắng nghe mọi nỗi niềm của bạn không phán xét, cùng chia sẻ về đồ án hoặc áp lực cuộc sống nhé..."
                          className="w-full bg-paper border border-hairline rounded-xl p-3 text-xs text-forest-ink placeholder:text-graphite focus:outline-none focus:border-jade-wash focus:bg-white transition-all resize-none"
                        />
                      </div>

                      <button
                        onClick={handleToggleMySeeker}
                        className="w-full py-3 px-5 rounded-pill bg-emerald-pulse hover:bg-pine text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-subtle cursor-pointer"
                      >
                        <Heart className="w-4 h-4 fill-white" />
                        <span>Bật trạng thái: Sẵn sàng chấp nhận tâm sự</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: GHÉP ĐÔI NGẪU NHIÊN */}
              {activeTab === 'random' && (
                <div className="bg-white border border-hairline rounded-2xl p-6 sm:p-8 text-center max-w-md mx-auto w-full shadow-subtle my-auto">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-mint-mist border border-emerald-pulse/30 flex items-center justify-center text-pine mb-4 mx-auto shadow-subtle">
                    <Shuffle className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-forest-ink font-display mb-2">
                    Ghép đôi ngẫu nhiên nhanh
                  </h3>
                  <p className="text-xs text-graphite leading-relaxed mb-6">
                    Hệ thống sẽ tự động ghép bạn với một người dùng ngẫu nhiên đang trực tuyến trong hàng đợi. 
                    Mọi trao đổi đều được bảo mật qua kết nối ngang hàng P2P.
                  </p>
                  <button
                    onClick={handleStartSearch}
                    className="w-full py-3 px-6 rounded-pill bg-emerald-pulse hover:bg-pine text-white text-xs font-bold shadow-subtle flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Bắt đầu tìm người tâm sự</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TRẠNG THÁI 2: WAITING - ĐANG CHỜ GHÉP ĐÔI NGẪU NHIÊN */}
          {chatStatus === 'WAITING' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto p-6">
              <div className="relative mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-emerald-pulse/20 border-t-emerald-pulse animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search className="w-6 h-6 sm:w-7 sm:h-7 text-pine" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-forest-ink font-display mb-1.5">Đang tìm bạn tâm sự...</h3>
              <p className="text-xs text-graphite max-w-xs mb-6">
                Đang tìm kiếm người trò chuyện ẩn danh phù hợp trong hàng đợi hệ thống.
              </p>
              <button
                onClick={handleCancelSearch}
                className="px-5 py-2.5 rounded-pill bg-white hover:bg-paper text-forest-ink text-xs font-medium border border-hairline shadow-subtle transition-colors cursor-pointer"
              >
                Hủy tìm kiếm
              </button>
            </div>
          )}

          {/* TRẠNG THÁI 3: CONNECTED - ĐANG TRONG PHÒNG CHAT */}
          {chatStatus === 'CONNECTED' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-paper/30">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-pill bg-mint-mist border border-emerald-pulse/30 text-pine text-xs font-medium mb-3">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Đã bắt tay WebRTC P2P thành công! Hãy gửi lời chào đầu tiên.</span>
                  </div>
                  <p className="text-[11px] text-graphite max-w-sm mx-auto">
                    Nếu phát hiện đối phương có dấu hiệu rủ rê việc nhẹ lương cao hoặc lừa tiền, hãy bấm nút <strong className="text-signal-red">AI Safety Shield</strong> ở góc trên bên phải.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  if (msg.isSystem) {
                    return (
                      <div key={idx} className="text-center py-2">
                        <span className="px-3 py-1 rounded-pill bg-white text-graphite border border-hairline text-xs shadow-subtle">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  const isMe = msg.sender === user?.anonymousName || msg.sender === 'Tôi';

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-graphite mb-1 px-1">
                        {isMe ? 'Bạn' : peerName || msg.sender}
                      </span>
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-subtle ${
                          isMe
                            ? 'bg-emerald-pulse text-white rounded-br-none'
                            : 'bg-white text-forest-ink border border-hairline rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator cho đối phương */}
              {isPeerTyping && (
                <div className="flex items-center space-x-2 py-1 text-graphite text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-pulse animate-bounce" />
                  <span>{peerName} đang soạn tin...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* THANH NHẬP VÀ GỬI TIN NHẮN (CHỈ HIỂN THỊ KHI CONNECTED) */}
        {/* ========================================================================= */}
        {chatStatus === 'CONNECTED' && (
          <form onSubmit={handleSendMessage} className="bg-white p-3 sm:p-4 border-t border-hairline flex items-center space-x-2">
            <input
              type="text"
              placeholder="Nhập tin nhắn trò chuyện ẩn danh (P2P)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-paper border border-hairline rounded-pill px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs text-forest-ink placeholder:text-graphite focus:outline-none focus:border-jade-wash focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-pill bg-emerald-pulse hover:bg-pine text-white text-xs font-medium transition-all shadow-subtle disabled:opacity-40 flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <span>Gửi</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: LỜI MỜI TÂM SỰ ĐẾN (INCOMING CHAT REQUEST) */}
      {/* ========================================================================= */}
      {incomingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-forest-ink/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-emerald-pulse/40 rounded-card w-[92vw] sm:max-w-md p-5 sm:p-6 shadow-xl relative animate-scale-up">
            <div className="text-center mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-mint-mist border border-emerald-pulse/30 mx-auto mb-3 flex items-center justify-center overflow-hidden p-2 shadow-subtle">
                <img
                  src={incomingRequest.requesterAvatar || '/images/avatars/avatar_whale.svg'}
                  alt={incomingRequest.requesterName}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-forest-ink font-display">
                Lời mời tâm sự ẩn danh
              </h3>
              <p className="text-xs text-graphite mt-1">
                Bút danh <strong className="text-forest-ink">{incomingRequest.requesterName}</strong> muốn kết nối trò chuyện 1-1 cùng bạn.
              </p>
            </div>

            {/* Chủ đề / Lời nhắn */}
            <div className="bg-paper rounded-xl p-3 border border-hairline text-xs text-forest-ink mb-5 text-center">
              <span className="text-[10px] text-graphite block mb-1 font-semibold uppercase tracking-wider">
                Tâm trạng / Chủ đề:
              </span>
              <span className="px-2.5 py-0.5 rounded-pill bg-mint-mist text-pine font-semibold text-[11px] inline-block mb-1">
                {incomingRequest.moodTag}
              </span>
              <p className="text-graphite italic text-[11px] mt-1 line-clamp-3">
                "{incomingRequest.note}"
              </p>
            </div>

            {/* Nút chấp nhận / từ chối */}
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <button
                onClick={handleDeclineIncomingRequest}
                className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-pill bg-paper hover:bg-red-50 text-graphite hover:text-signal-red border border-hairline text-xs font-semibold transition-all cursor-pointer"
              >
                Từ chối
              </button>
              <button
                onClick={handleAcceptIncomingRequest}
                className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-pill bg-emerald-pulse hover:bg-pine text-white text-xs font-semibold shadow-subtle transition-all cursor-pointer flex items-center justify-center space-x-1 sm:space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Chấp nhận tâm sự</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ĐANG CHỜ ĐỐI PHƯƠNG CHẤP NHẬN LỜI MỜI */}
      {/* ========================================================================= */}
      {isWaitingForResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-forest-ink/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-hairline rounded-card w-[92vw] sm:max-w-sm p-5 sm:p-6 shadow-xl text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-emerald-pulse/20 border-t-emerald-pulse animate-spin mx-auto mb-4" />
            <h3 className="text-sm sm:text-base font-bold text-forest-ink font-display mb-1.5">
              Đang gửi lời mời tâm sự...
            </h3>
            <p className="text-xs text-graphite mb-5">
              Đang chờ <strong className="text-forest-ink">{pendingTargetName}</strong> chấp nhận kết nối trò chuyện cùng bạn.
            </p>
            <button
              onClick={handleCancelPendingRequest}
              className="px-5 py-2 rounded-pill bg-paper hover:bg-white text-graphite border border-hairline text-xs font-medium transition-colors cursor-pointer"
            >
              Hủy yêu cầu
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TRỢ LÝ AI SAFETY SHIELD PHÂN TÍCH RỦI RO */}
      {/* ========================================================================= */}
      <SafetyShieldModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
        analysis={safetyAnalysis}
        onDisconnectPeer={handleLeaveRoom}
      />
    </div>
  );
}
