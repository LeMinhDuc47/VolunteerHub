import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { IEvent, IPost, IComment } from "@/types/backend";
import { callFetchEventById, callFetchEventPosts, callCreatePost, callCreateComment, callLikePost, callFetchResumeByUser } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton, Tabs, List, Avatar, Button, Form, Input, message, Space, Typography, Empty, Alert, Modal } from "antd";
import { EnvironmentOutlined, CommentOutlined, LikeOutlined, SendOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/redux/hooks";


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
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // job id

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true);
                const res = await callFetchEventById(id);
                if (res?.data) {
                    setEventDetail(res.data);
                }
                setIsLoading(false);
            }
        };
        init();
    }, [id]);

    useEffect(() => {
        if (eventDetail?.id && activeTab === 'discussion') {
            fetchPosts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventDetail, activeTab]);

    useEffect(() => {
        if (eventDetail?.id && activeTab === 'discussion' && isAuthenticated) {
            checkMember();
        } else if (!isAuthenticated) {
            setIsMember(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // setLoadingMember(false);
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
            <div>
                {!isAuthenticated && (
                    <div style={{ marginBottom: 16 }}>
                        <Button type="primary" onClick={() => navigate('/auth/login')}>Đăng nhập để tham gia</Button>
                    </div>
                )}

                {isAuthenticated && (loadingMember ? (
                    <Skeleton active />
                ) : (
                    isMember ? (
                        <Form form={form} layout="vertical" onFinish={handleCreatePost} style={{ marginBottom: 24 }}>
                            <Form.Item name="content" label="Tạo bài viết" rules={[{ required: true, message: 'Nhập nội dung bài viết' }]}>
                                <Input.TextArea rows={4} placeholder="Chia sẻ điều gì đó..." />
                            </Form.Item>
                            <Button type="primary" htmlType="submit" loading={creatingPost} icon={<SendOutlined />}>Đăng bài</Button>
                        </Form>
                    ) : (
                        <Alert
                            type="info"
                            message="Bạn cần là thành viên chính thức (được duyệt) để tham gia thảo luận"
                            description={
                                <Space direction="vertical">
                                    <Typography.Text>Hãy gửi hồ sơ ứng tuyển vào một vị trí thuộc sự kiện này và chờ duyệt.</Typography.Text>
                                    <Button type="primary" onClick={() => setShowApplyModal(true)}>Đăng ký tham gia</Button>
                                </Space>
                            }
                            showIcon
                        />
                    )
                ))}
                <List
                    loading={loadingPosts}
                    dataSource={posts}
                    locale={{ emptyText: 'Chưa có bài viết nào' }}
                    renderItem={(item) => <PostItem post={item} onComment={handleAddComment} onLike={handleLikePost} />}
                />
                <Modal
                    open={showApplyModal}
                    title="Đăng ký tham gia sự kiện"
                    onCancel={() => setShowApplyModal(false)}
                    footer={<Button onClick={() => setShowApplyModal(false)}>Đóng</Button>}
                >
                    <Typography.Paragraph>
                        Chức năng đăng ký tham gia: Vui lòng chuyển tới trang công việc và ứng tuyển một vị trí. Sau khi hồ sơ được duyệt (APPROVED), bạn sẽ có thể đăng bài và thảo luận.
                    </Typography.Paragraph>
                    <Button type="link" onClick={() => navigate(`/job?eventId=${eventDetail?.id}`)}>Xem các công việc của sự kiện</Button>
                </Modal>
            </div>
        );
    };

    const PostItem = ({ post, onComment, onLike }: { post: IPost; onComment: (p: IPost, c: string) => void; onLike: (p: IPost) => void }) => {
        const [showCommentBox, setShowCommentBox] = useState(false);
        const [commentContent, setCommentContent] = useState('');
        const created = post.createdAt ? new Date(post.createdAt).toLocaleString() : '';
        return (
            <List.Item style={{ padding: 16, background: '#fff', marginBottom: 12, borderRadius: 8 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                        <Avatar>{post.user?.name?.charAt(0) || '?'}</Avatar>
                        <div>
                            <Typography.Text strong>{post.user?.name || 'Ẩn danh'}</Typography.Text>
                            <br />
                            <Typography.Text type="secondary" style={{ fontSize: 12 }}>{created}</Typography.Text>
                        </div>
                    </Space>
                    <Typography.Paragraph style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{post.content}</Typography.Paragraph>
                    <Space>
                        <Button icon={<LikeOutlined />} onClick={() => onLike(post)}>{post.likesCount || 0}</Button>
                        <Button icon={<CommentOutlined />} onClick={() => setShowCommentBox(s => !s)}>{post.commentsCount || 0}</Button>
                    </Space>
                    {showCommentBox && (
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Input.TextArea rows={2} value={commentContent} placeholder="Viết bình luận..." onChange={e => setCommentContent(e.target.value)} />
                            <Button type="primary" disabled={!commentContent.trim()} onClick={() => { onComment(post, commentContent); setCommentContent(''); }}>Gửi</Button>
                            <div>
                                {(post.comments || []).map(c => (
                                    <Space key={c.id} align="start" style={{ display: 'flex', marginTop: 8 }}>
                                        <Avatar size="small">{c.user?.name?.charAt(0) || 'U'}</Avatar>
                                        <div style={{ background: '#f5f5f5', padding: '6px 10px', borderRadius: 6, flex: 1 }}>
                                            <Typography.Text strong style={{ fontSize: 12 }}>{c.user?.name || 'Ẩn danh'}</Typography.Text>
                                            <div style={{ fontSize: 12 }}>{c.content}</div>
                                        </div>
                                    </Space>
                                ))}
                            </div>
                        </Space>
                    )}
                </Space>
            </List.Item>
        );
    };

    return (
        <div className={`${styles["container"]} ${styles["detail-job-section"]}`}>
            {isLoading || !eventDetail ? <Skeleton /> : (
                <Tabs activeKey={activeTab} onChange={onChangeTab} items={[
                    {
                        key: 'detail',
                        label: 'Chi tiết',
                        children: (
                            <Row gutter={[20, 20]}>
                                <Col span={24} md={16}>
                                    <div className={styles["header"]}>{eventDetail.name}</div>
                                    <div className={styles["location"]}>
                                        <EnvironmentOutlined style={{ color: '#58aaab' }} />&nbsp;{eventDetail.address}
                                    </div>
                                    <Divider />
                                    {parse(eventDetail.description ?? "")}
                                </Col>
                                <Col span={24} md={8}>
                                    <div className={styles["event"]}>
                                        <div>
                                            <img width={200} alt="example" src={`${import.meta.env.VITE_BACKEND_URL}/storage/event/${eventDetail.logo}`} />
                                        </div>
                                        <div>{eventDetail.name}</div>
                                    </div>
                                </Col>
                            </Row>
                        )
                    },
                    {
                        key: 'discussion',
                        label: 'Thảo luận',
                        children: renderDiscussionTab()
                    }
                ]} />
            )}
        </div>
    );
}
export default ClientEventDetailPage;