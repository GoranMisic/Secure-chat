import {newChannel,createMessage} from './index.js';
import { authorization, showErrorMessage } from './validation.js';
import { createChannel } from './manipulateMessages.js';
import { containers, forms, buttons, inputs, state } from './index.js';


async function signUp() {
    const user = {
      userName: inputUserName.value,
      password: inputPassword.value,
    };
  
    const options = {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'Content-type': 'application/json',
      },
    };
  
    try {
      const response = await fetch('/api/login/create', options);
  
      if (response.ok) {
        state.loggedInUser = await response.json();
        return true;
      }
  
      return false;
    } catch (error) {
      showErrorMessage();
      console.log(`Could not POST to server. Error Message: ${error.message}`);
    }
  }
  

async function tryLogin() {
    let maybeLoggedIn = await loginUser();
    
    if (!maybeLoggedIn) {
        forms.errorLogin.classList.remove('invisible');
    } else {
        localStorage.setItem(state.JWT_KEY, maybeLoggedIn.token);
        state.loggedInUser = { userName: `${maybeLoggedIn.user.userName}` };
        state.isLoggedIn = true;
        forms.errorLogin.classList.add('invisible');
        updateLoggedUI();
    }
}


async function loginUser() {
    const user = {
      userName: inputs.inputUserName.value,
      password: inputs.inputPassword.value,
    };
  
    const options = {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'Content-type': 'application/json',
      },
    };
  
    try {
      const response = await fetch('/api/login/', options);
  
      if (response.ok) {
        const user = await response.json();
        return user;
      }
  
      console.log(`Login failed: ${response.status}`);
      return false;
    } catch (error) {
      showErrorMessage();
      console.log(`Could not POST to server. Error Message: ${error.message}`);
    }
  }
  
  async function trySignUp() {
    const maybeSignedUp = await signUp();
  
    if (maybeSignedUp) {
      const maybeLoggedIn = await loginUser();
  
      localStorage.setItem(state.JWT_KEY, maybeLoggedIn.token);
      state.loggedInUser = { userName: maybeLoggedIn.userName };
      state.isLoggedIn = true;
  
      forms.errorSignUp.classList.add('invisible');
      updateLoggedUI();
    } else {
      inputs.inputPassword.value = '';
      inputs.inputUserName.value = '';
  
      forms.errorSignUp.classList.remove('invisible');
    }
  }
  

checkForLoggedin();
buttons.btnSendMessage.addEventListener('click', sendNewMessage);

forms.submitForms.forEach((form) =>
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (form.checkValidity() === false) {
            form.reportValidity();
            return;
        }
        if (e.submitter.id === 'btnLogin') {
            tryLogin();
        }
        if (e.submitter.id === 'btnSignUp') {
            trySignUp();
        }
        if (e.submitter.id === 'btnCreateChannel') {
            tryNewChannel();
        }
    })
);

buttons.btnLogout.addEventListener('click', () => {
    state.isLoggedIn = false;
    state.loggedInUser = { userName: 'Guest' };
    localStorage.removeItem(state.JWT_KEY);
    updateLoggedUI();
});

buttons.btncloseEdit.addEventListener('click', () => {
    inputs.inputEdit.value = '';
    containers.editContainer.classList.add('invisible');
});

async function tryNewChannel() {
    if (await createChannel()) {
        getChannelNames();
        forms.errorChannel.classList.add('invisible');
        inputs.inputChannelName.value = '';
    } else {
        forms.errorChannel.classList.remove('invisible');
    }
}

async function checkForLoggedin() {
    let maybeLoggedIn = await authorization();

    if (maybeLoggedIn) {
        state.loggedInUser = { userName: `${maybeLoggedIn.userName}` };
        state.isLoggedIn = true;
    } else {
        state.loggedInUser = { userName: 'Guest' };
    }
    updateLoggedUI();
}

function updateLoggedUI() {
    containers.channelsContainer.innerHTML = '';
    inputs.inputUserName.value = '';
    inputs.inputPassword.value = '';
    containers.chatContainer.innerHTML = '';
    
    if (state.isLoggedIn) {
      updateUserNameOutput(state.loggedInUser.userName);
      hideElement(forms.userForm);
      showElement(buttons.btnLogout);
      showElement(containers.createContainer);
    } else {
      updateUserNameOutput('Guest');
      state.activeChannel = '';
      hideElement(buttons.btnLogout);
      hideElement(containers.createContainer);
      showElement(forms.userForm);
      hideElement(forms.errorSignUp);
      hideElement(forms.errorLogin);
      hideElement(containers.newMessageContainer);
    }
    
    getChannelNames();
  }
  
  function updateUserNameOutput(userName) {
    for (const nameOutput of forms.nameOutput) {
      nameOutput.innerText = userName;
    }
  }
  
  function showElement(element) {
    element.classList.remove('invisible');
  }
  
  function hideElement(element) {
    element.classList.add('invisible');
  }
async function sendNewMessage() {
    const newMessage = {
        message: inputs.inputMessage.value,
        userName: state.loggedInUser.userName,
    };

    const options = {
        method: 'POST',
        body: JSON.stringify(newMessage),
        headers: {
            'Content-type': 'application/json',
        },
    };

    try {
        const response = await fetch(
            '/api/public/channels/' + `${state.activeChannel.name}`,
            options
        );
        if (response.status === 200) {

            await getMessages();
            inputs.inputMessage.value = '';
            return true;
        } else {
            return false;
        }
    } catch (error) {
        showErrorMessage();
        console.log(
            'Could not POST to server. Error Message: ' + error.message
        );
        return;
    }
}

async function getChannelNames() {
    containers.channelsContainer.innerHTML = '';
    let nameArray = [];
    try {
        const response = await fetch('/api/public/channels');
        nameArray = await response.json();
        if (response.status !== 200) {
            showErrorMessage();
            console.log(
                'Could not connect to server. Status: ' + response.status
            );

            return;
        }
    } catch (error) {
        showErrorMessage();
        console.log(
            'Could not GET data from the server. Error message: ' +
                error.message
        );
        return;
    }

    for (const channelName of nameArray) {
        newChannel(channelName);
    }
}

async function getMessages() {
    containers.chatContainer.innerHTML = '';
    let messageArray = [];
    try {
        const response = await fetch(
            `/api/public/channels/${state.activeChannel.name}/messages`
        );
        messageArray = await response.json();
        if (response.status !== 200) {
            console.log(
                'Could not connect to server. Status: ' + response.status
            );

            return;
        }
    } catch (error) {
        showErrorMessage();
        console.log(
            'Could not GET data from the server. Error message: ' +
                error.message
        );
        return;
    }

    for (const message of messageArray) {
        createMessage(message);
    }
}

export { getMessages, getChannelNames, updateLoggedUI, checkForLoggedin,signUp, loginUser, tryLogin, trySignUp };