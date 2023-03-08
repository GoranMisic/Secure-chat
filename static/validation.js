import { state } from './index.js';

const checkChannelAuth = async (name) => {
  if (name.private) {
    const isAuthorized = await authorization();
    return isAuthorized;
  }
  return true;
};

const authorization = async () => {
  const jwt = localStorage.getItem(state.JWT_KEY);

  if (!jwt) {
    return false;
  }

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
  };
  const response = await fetch('/api/private/', options);

  if (response.status === 200) {
    const user = await response.json();
    return user;
  }
  return false;
};

const showErrorMessage = () => {
  const oopsContainer = document.querySelector('#oops-container');
  oopsContainer.style.display = 'block';
  setTimeout(() => {
    oopsContainer.style.display = 'none';
  }, 3000);
};

export { checkChannelAuth, authorization, showErrorMessage };