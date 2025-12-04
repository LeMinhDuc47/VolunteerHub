import g1 from '@/assets/donate.jpg';

const DonateUsPage = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={g1}
        alt="Ủng hộ chúng tôi"
        style={{
          maxWidth: '90%',
          maxHeight: '80vh',
          objectFit: 'contain',
          borderRadius: '12px',
        }}
      />
    </div>
  );
};

export default DonateUsPage;
