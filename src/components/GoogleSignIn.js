import React from "react"
import { useEffect } from "react"
import "../custom.css"
import axios from "axios"
import { navigate } from "gatsby"
import "../styles/social.css"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { useGoogleLogin } from "@react-oauth/google"

const GoogleSignIn = props => {
  useEffect(() => {
    if (localStorage.token) {
      navigate("/dashboard/")
    }
  }, [])
  const registerUser = idToken => {
    axios
      .post(
        `${process.env.GATSBY_API_URL}quiz/auth/register`,
        {
          accesstoken: idToken,
          type: "1",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(res => {
        localStorage.token = res.data.token
        navigate("/dashboard/")
      })
  }

  const setData = res => {
    registerUser(res.data.id_token)
  }

  const login = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async tokenResponse => {
      const data = await axios.post(
        `https://oauth2.googleapis.com/token?code=${tokenResponse.code}&redirect_uri=${process.env.GATSBY_REDIRECT_URI}&client_id=${process.env.GATSBY_GOOGLE_LOGIN_CLIENT_ID}&client_secret=${process.env.GATSBY_GOOGLE_LOGIN_CLIENT_SECRET}&grant_type=authorization_code`
      )
      setData(data)
      const userInfo = await axios
        .get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${data.data.access_token}` },
        })
        .then(res => {
          localStorage.email = res.data.email
          localStorage.image = res.data.picture
          localStorage.name = res.data.name
        })
        .catch(error => console.log(error))
    },
    onFailure: res => {
      console.log(res)
    },
    cookiePolicy: "single_host_origin",
    className: props.className,
  })

  return (
    <GoogleOAuthProvider clientId={process.env.GATSBY_GOOGLE_LOGIN_CLIENT_ID}>
      <div className="social-btns">
        <button className="btn google" onClick={login}>
          <i className="fa fa-google" />
        </button>
      </div>
    </GoogleOAuthProvider>
  )
}
export default GoogleSignIn
