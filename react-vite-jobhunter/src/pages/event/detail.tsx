import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import { IEvent, IPost, IComment } from "@/types/backend";
import { callFetchEventById, callFetchEventPosts, callCreatePost, callCreateComment, callLikePost, callFetchResumeByUser } from "@/config/api";
import "@/styles/pages/event_detail_style.css"; 
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton, Tabs, List, Avatar, Button, Form, Input, message, Space, Typography, Alert, Modal, Empty } from "antd";
import { EnvironmentOutlined, CommentOutlined, LikeOutlined, SendOutlined, CalendarOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/redux/hooks";
import dayjs from "dayjs";

const ClientEventDetailPage = (props: any) => {
    const [eventDetail, setEventDetail] = useState<IEvent | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [posts, setPosts] = useState<IPost[]>([]);
    const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
    const [creatingPost, setCreatingPost] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get('tab') || 'detail';
        } catch {
            return 'detail';
        }
    });
    const [isMember, setIsMember] = useState<boolean>(false);
    const [loadingMember, setLoadingMember] = useState<boolean>(false);
    const [showApplyModal, setShowApplyModal] = useState<boolean>(false);

    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

    const formatDateTime = (date?: string) => {
        if (!date) return 'N/A';
        return dayjs(date).format('DD/MM/YYYY');
    };


    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const queryId = params?.get("id");

    useEffect(() => {
        const init = async () => {
            const eventId = id || queryId;
            if (eventId) {
                setIsLoading(true);
                const res = await callFetchEventById(eventId);
                if (res?.data) {
                    setEventDetail(res.data);
                }
                setIsLoading(false);
            }
        };
        init();
    }, [id, queryId]);

    useEffect(() => {
        if (eventDetail?.id && activeTab === 'discussion') {
            fetchPosts();
        }
    }, [eventDetail, activeTab]);

    useEffect(() => {
        if (eventDetail?.id && activeTab === 'discussion' && isAuthenticated) {
            checkMember();
        } else if (!isAuthenticated) {
            setIsMember(false);
        }
    }, [eventDetail, activeTab, isAuthenticated]);

    const fetchPosts = async () => {
        if (!eventDetail?.id) return;
        setLoadingPosts(true);
        try {
            const res = await callFetchEventPosts(eventDetail.id);
            if (res?.data) {
                const mapped = (res.data || []).map((p: any) => {
                    const comments = (p.comments || []).map((c: any) => ({
                        id: String(c.id),
                        content: c.content || '',
                        createdAt: c.createdAt,
                        user: c.user
                    } as IComment));

                    const post: IPost = {
                        id: String(p.id),
                        content: p.content || '',
                        createdAt: p.createdAt,
                        user: p.user,
                        comments,
                        likesCount: p.totalLikes || 0,
                        commentsCount: comments.length
                    };
                    return post;
                });
                setPosts(mapped);
            }
        } catch (e) {
            message.error('Không thể tải bài viết');
        }
        setLoadingPosts(false);
    };

    const handleCreatePost = async (values: { content: string }) => {
        if (!eventDetail?.id) return;
        setCreatingPost(true);
        try {
            const res = await callCreatePost(eventDetail.id, values.content);
            if (res?.data) {
                const newPost = res.data!;
                setPosts(prev => [{ ...newPost, content: newPost.content || '', likesCount: 0, commentsCount: 0, comments: [] } as IPost, ...prev]);
                message.success('Đăng bài thành công');
                form.resetFields();
            }
        } catch (e) {
            message.error('Đăng bài thất bại');
        }
        setCreatingPost(false);
    };

    const checkMember = async () => {
        if (!eventDetail?.id) return;
        try {
            const res = await callFetchResumeByUser();
            const list = res?.data?.result || [];
            const currentEventId = eventDetail.id;

            const approved = list.some((r: any) => {
                if (r?.status !== 'APPROVED') return false;
                const resumeEventId = r?.job?.eventId;
                return resumeEventId == currentEventId;
            });

            setIsMember(approved);
        } catch (e) {
            console.log(e);
            setIsMember(false);
        }
    };

    const handleAddComment = async (post: IPost, content: string) => {
        if (!post.id) return;
        try {
            const res = await callCreateComment(post.id, content);
            if (res?.data) {
                setPosts(prev => prev.map(p => {
                    if (p.id === post.id) {
                        const newComments = [...(p.comments || []), res.data as IComment];
                        return { ...p, comments: newComments, commentsCount: (p.commentsCount || 0) + 1 };
                    }
                    return p;
                }));
                message.success('Đã bình luận');
            }
        } catch (e) {
            message.error('Bình luận thất bại');
        }
    };

    const handleLikePost = async (post: IPost) => {
        if (!post.id) return;
        try {
            await callLikePost(post.id);
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p));
        } catch (e) {
            message.error('Thả tim thất bại');
        }
    };

    const onChangeTab = (key: string) => {
        setActiveTab(key);
        const sp = new URLSearchParams(location.search);
        if (id) sp.set('id', id);
        sp.set('tab', key);
        navigate({ search: sp.toString() }, { replace: true });
    };

    const [form] = Form.useForm();

    const renderDiscussionTab = () => {
        if (!eventDetail) return <Skeleton />;
        return (
            <div className="discussion-container">
                {!isAuthenticated && (
                    <div style={{ marginBottom: 24, padding: 20, background: '#fff', borderRadius: 8 }}>
                        <Alert
                            message="Yêu cầu đăng nhập"
                            description="Vui lòng đăng nhập để xem và tham gia thảo luận cùng mọi người."
                            type="warning"
                            showIcon
                            action={
                                <Button type="primary" onClick={() => navigate('/auth/login')}>
                                    Đăng nhập ngay
                                </Button>
                            }
                        />
                    </div>
                )}

                {isAuthenticated && (loadingMember ? (
                    <Skeleton active />
                ) : (
                    isMember ? (
                        <div style={{ background: '#fff', padding: 20, borderRadius: 12, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                            <Form form={form} layout="vertical" onFinish={handleCreatePost}>
                                <Form.Item name="content" rules={[{ required: true, message: 'Nhập nội dung bài viết' }]} style={{ marginBottom: 12 }}>
                                    <Input.TextArea
                                        rows={3}
                                        placeholder={`Chào ${eventDetail.name}, bạn đang nghĩ gì?`}
                                        style={{ borderRadius: 8, resize: 'none', border: 'none', background: '#f5f5f5', padding: 12 }}
                                    />
                                </Form.Item>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button type="primary" htmlType="submit" loading={creatingPost} icon={<SendOutlined />} style={{ borderRadius: 6 }}>
                                        Đăng bài
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    ) : (
                        <div style={{ marginBottom: 24 }}>
                            <Alert
                                type="info"
                                message="Khu vực dành cho thành viên"
                                description={
                                    <Space direction="vertical" size="small">
                                        <Typography.Text>Bạn cần ứng tuyển và được duyệt tham gia sự kiện này để có thể đăng bài.</Typography.Text>
                                        <Button type="primary" size="small" ghost onClick={() => setShowApplyModal(true)}>Đăng ký tham gia ngay</Button>
                                    </Space>
                                }
                                showIcon
                            />
                        </div>
                    )
                ))}
                
                <List
                    loading={loadingPosts}
                    dataSource={posts}
                    locale={{ emptyText: <Empty description="Chưa có bài viết nào. Hãy là người đầu tiên!" /> }}
                    renderItem={(item) => <PostItem post={item} onComment={handleAddComment} onLike={handleLikePost} />}
                />
                
                <Modal
                    open={showApplyModal}
                    title="Đăng ký tham gia sự kiện"
                    onCancel={() => setShowApplyModal(false)}
                    footer={[
                        <Button key="back" onClick={() => setShowApplyModal(false)}>Đóng</Button>,
                        <Button key="submit" type="primary" onClick={() => navigate(`/job?eventId=${eventDetail?.id}`)}>
                            Xem công việc
                        </Button>
                    ]}
                >
                    <Typography.Paragraph>
                        Để đảm bảo chất lượng thảo luận, chỉ những tình nguyện viên đã được duyệt hồ sơ (Status: APPROVED) mới có thể đăng bài.
                        <br />Vui lòng tìm một công việc phù hợp trong sự kiện và ứng tuyển.
                    </Typography.Paragraph>
                </Modal>
            </div>
        );
    };

    const PostItem = ({ post, onComment, onLike }: { post: IPost; onComment: (p: IPost, c: string) => void; onLike: (p: IPost) => void }) => {
        const [showCommentBox, setShowCommentBox] = useState(false);
        const [commentContent, setCommentContent] = useState('');
        const created = post.createdAt ? new Date(post.createdAt).toLocaleString('vi-VN') : '';
        
        return (
            <div className="post-item">
                <Space align="start" style={{ width: '100%', marginBottom: 12 }}>
                    <Avatar size="large" style={{ backgroundColor: '#58aaab' }}>{post.user?.name?.charAt(0)?.toUpperCase() || 'U'}</Avatar>
                    <div>
                        <Typography.Text strong style={{ fontSize: 16 }}>{post.user?.name || 'Thành viên ẩn danh'}</Typography.Text>
                        <div style={{ fontSize: 12, color: '#888' }}>{created}</div>
                    </div>
                </Space>
                
                <Typography.Paragraph style={{ fontSize: 15, whiteSpace: 'pre-wrap', color: '#333' }}>
                    {post.content}
                </Typography.Paragraph>
                
                <div className="post-actions">
                    <Space size="middle">
                        <Button 
                            type="text" 
                            icon={<LikeOutlined style={{ color: post.likesCount ? '#1890ff' : 'inherit' }} />} 
                            onClick={() => onLike(post)}
                        >
                            {post.likesCount ? `${post.likesCount} Thích` : 'Thích'}
                        </Button>
                        <Button type="text" icon={<CommentOutlined />} onClick={() => setShowCommentBox(s => !s)}>
                            {post.commentsCount ? `${post.commentsCount} Bình luận` : 'Bình luận'}
                        </Button>
                    </Space>
                </div>

                {showCommentBox && (
                    <div className="comment-box-area">
                         {/* List Comments */}
                         <div style={{ marginBottom: 16 }}>
                            {(post.comments || []).map(c => (
                                <div key={c.id} className="comment-item">
                                    <Avatar size="small" style={{ backgroundColor: '#fde3cf', color: '#f56a00' }}>{c.user?.name?.charAt(0)?.toUpperCase()}</Avatar>
                                    <div className="comment-bubble">
                                        <span className="comment-author">{c.user?.name || 'Ẩn danh'}</span>
                                        <span className="comment-text">{c.content}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <Space.Compact style={{ width: '100%' }}>
                            <Input 
                                placeholder="Viết bình luận..." 
                                value={commentContent} 
                                onChange={e => setCommentContent(e.target.value)} 
                                onPressEnter={() => { if(commentContent.trim()) { onComment(post, commentContent); setCommentContent(''); }}}
                            />
                            <Button type="primary" disabled={!commentContent.trim()} onClick={() => { onComment(post, commentContent); setCommentContent(''); }}>
                                <SendOutlined />
                            </Button>
                        </Space.Compact>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="event-detail-container">
            <div className="event-wrapper">
                {isLoading || !eventDetail ? <Skeleton active paragraph={{ rows: 10 }} /> : (
                    <Tabs 
                        defaultActiveKey="detail"
                        activeKey={activeTab} 
                        onChange={onChangeTab} 
                        items={[
                        {
                            key: 'detail',
                            label: 'Chi tiết sự kiện',
                            children: (
                                <Row gutter={[32, 32]}>
                                    <Col span={24} md={16} order={1}>
                                        <div className="event-main-content">
                                            <div className="event-header-title">{eventDetail.name}</div>

                                            <div className="event-meta-row">
                                                <div className="event-location">
                                                    <EnvironmentOutlined style={{ color: '#58aaab' }} />
                                                    <span>{eventDetail.address}</span>
                                                </div>

                                                <div className="event-date-info event-date-inline">
                                                    <div className="event-date-item">
                                                        <CalendarOutlined className="date-icon" />
                                                        <span className="date-label">Bắt đầu:</span>
                                                        <span className="date-value">{formatDateTime(eventDetail.startDate)}</span>
                                                    </div>
                                                    <div className="event-date-item">
                                                        <CalendarOutlined className="date-icon" />
                                                        <span className="date-label">Kết thúc:</span>
                                                        <span className="date-value">{formatDateTime(eventDetail.endDate)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Divider style={{ margin: '16px 0' }} />
                                            <div className="event-description">
                                                {parse(eventDetail.description ?? "")}
                                            </div>
                                        </div>

                                    </Col>
                                    <Col span={24} md={8} order={2}>
                                        <div className="event-sidebar-card">
                                            <div className="event-sidebar-image-wrapper">
                                                <img 
                                                    className="event-sidebar-image"
                                                    alt={eventDetail.name} 
                                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/event/${eventDetail.logo}`}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Event+Image";
                                                    }}
                                                />
                                            </div>
                                            <div className="event-sidebar-name">{eventDetail.name}</div>
                                            <Button type="primary" block size="large" onClick={() => navigate(`/job?eventId=${eventDetail?.id}`)}>
                                                Xem các vị trí ứng tuyển
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            )
                        },
                        {
                            key: 'discussion',
                            label: 'Thảo luận & Hỏi đáp',
                            children: (
                                <Row gutter={[32, 32]}>
                                    <Col span={24} md={16}>
                                         {renderDiscussionTab()}
                                    </Col>
                                    <Col span={24} md={8}>
                                        <div className="event-sidebar-card" style={{ textAlign: 'left' }}>
                                            <Typography.Title level={5}>Quy tắc thảo luận</Typography.Title>
                                            <ul style={{ paddingLeft: 20, color: '#666' }}>
                                                <li>Lịch sự, tôn trọng lẫn nhau.</li>
                                                <li>Không spam hoặc quảng cáo.</li>
                                                <li>Chỉ bàn luận về sự kiện này.</li>
                                            </ul>
                                        </div>
                                    </Col>
                                </Row>
                            )
                        }
                    ]} />
                )}
            </div>
        </div>
    );
}
export default ClientEventDetailPage;