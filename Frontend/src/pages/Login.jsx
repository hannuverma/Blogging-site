import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

function Login() {
  const handleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;

    const res = await axios.post("http://localhost:8000/api/google-login/", {
      token: token
    });

    console.log(res.data);
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log("Login Failed")}
    />
  );
}

export default Login;