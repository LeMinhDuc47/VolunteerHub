import { useEffect } from 'react';
import { Spin, message } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@/redux/hooks';
import { fetchAccount } from '@/redux/slice/accountSlide';

const OAuth2RedirectPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            message.error('Không tìm thấy token. Vui lòng đăng nhập lại.');
            navigate('/login');
            return;
        }

        localStorage.setItem('access_token', token);
        dispatch(fetchAccount())
            .unwrap()
            .then(() => navigate('/home'))
            .catch(() => {
                message.error('Không thể lấy thông tin tài khoản. Vui lòng thử lại.');
                navigate('/login');
            });
    }, [searchParams, dispatch, navigate]);

    return (
        <div className="oauth2-redirect" style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <Spin size="large" tip="Đang xử lý đăng nhập Google..." />
        </div>
    );
};

export default OAuth2RedirectPage;
