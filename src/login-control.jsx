export default function LoginControl(props) {
  if (props.loggedIn) {
    return(
      <p>
        <button id="logout-button">Logout</button>
      </p>
    );
  } else {
    return(
      <p>
        <button id="login-button">Login with YouTube</button>
      </p>
    );
  }
}
