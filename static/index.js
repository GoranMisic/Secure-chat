import { getMessages } from './script.js';
import { checkChannelAuth } from './validation.js';
import { removeMessage, editMessage } from './manipulateMessages.js';


const containers = {
    channelsContainer: document.querySelector('#channelsContainer'),
    chatContainer: document.querySelector('#chatContainer'),
    editContainer: document.querySelector('.editContainer'),
    createContainer: document.querySelector('.createContainer'),
    newMessageContainer: document.querySelector('.new-message'),
};

const forms = {
    submitForms: document.querySelectorAll('.loginCreate-Form '),
    userForm: document.querySelector('.namePassword-form'),
    nameOutput: document.querySelectorAll('.name-output'),
    errorLogin: document.querySelector('#error-login'),
    errorSignUp: document.querySelector('#error-signup'),
    errorChannel: document.querySelector('.error-channel'),
};

const buttons = {
    btnLogin: document.querySelector('#btnLogin'),
    btnSignUp: document.querySelector('#btnSignUp'),
    btnLogout: document.querySelector('#btnLogout'),
    btnSendMessage: document.querySelector('#send-message'),
    btnsendEdit: document.querySelector('#sendEdit'),
    btncloseEdit: document.querySelector('#closeEdit'),
    btnCreateChannel: document.querySelector('#btnCreateChannel'),
};

const inputs = {
    inputMessage: document.querySelector('#inputMessage'),
    inputUserName: document.querySelector('#inputUserName'),
    inputPassword: document.querySelector('#inputPassword'),
    inputEdit: document.querySelector('#inputEdit'),
    inputChannelName: document.querySelector('#inputChannelName'),
    checkBox: document.querySelector('#Private'),
};

const state = {
    JWT_KEY: 'secureChat-jwt',
    isLoggedIn: false,
    loggedInUser: { userName: '' },
    activeChannel: '',
};





const channelsContainer = document.querySelector('#channelsContainer');

async function newChannel(channelName) {
    const messagesChannels = document.createElement('section');
    messagesChannels.classList.add('messagesChannels');
  
    const spanChannel = document.createElement('span');
    const spanName = document.createElement('span');
    spanName.innerText = channelName.name;
    spanChannel.appendChild(spanName);
  
    if (channelName.private && !state.isLoggedIn) {
      const lockIcon = document.createElement('i');
      spanChannel.appendChild(lockIcon);
    }
  
    let maybeAllowed = await checkChannelAuth(channelName);
    if (maybeAllowed) {
      messagesChannels.classList.add('clickableChannel');
      messagesChannels.addEventListener('click', handleChannelClick);
    } else {
      const tooltip = document.createElement('span');
      tooltip.innerHTML = '<p id="tooltip-text">Log in for acces!</p>';
      tooltip.style.display = 'none';
      messagesChannels.classList.add('disabledChannel');
      messagesChannels.addEventListener('mouseover', () => {
        tooltip.style.display = 'block';
      });
      messagesChannels.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });
      messagesChannels.appendChild(tooltip);
    }
  
    function handleChannelClick() {
      const channelBoxes = Array.from(channelsContainer.children);
      channelBoxes.forEach(box => box.classList.remove('selectedChannel'));
  
      state.activeChannel = channelName;
      messagesChannels.classList.add('selectedChannel');
      containers.newMessageContainer.classList.remove('invisible');
  
      getMessages();
    }
  
    messagesChannels.appendChild(spanChannel);
    channelsContainer.appendChild(messagesChannels);
  }

  function InfoElements(messageObject) {
    const { timeCreated, userName, deleted } = messageObject;
  
    const divInfo = document.createElement('div');
    divInfo.classList.add('infoContainer');
  
    if (!deleted) {
      const spanUserName = document.createElement('span');
      spanUserName.classList.add('userName');
      spanUserName.innerText = userName;
  
      const spanDate = document.createElement('span');
      spanDate.classList.add('date');
      spanDate.innerText = timeCreated;
  
      divInfo.appendChild(spanUserName);
      divInfo.appendChild(spanDate);
    }
  
    if (state.isLoggedIn && userName === state.loggedInUser.userName) {
      const spanIcons = document.createElement('span');
      spanIcons.classList.add('icons');
  
      const iconEdit = document.createElement('i');
      iconEdit.className = 'fa-solid fa-pen-to-square';
      iconEdit.addEventListener('click', () => {
        containers.editContainer.classList.remove('invisible');
        selectedMessage = messageObject;
        inputs.inputEdit.value = selectedMessage.message;
      });
      spanIcons.appendChild(iconEdit);
  
      const iconTrash = document.createElement('i');
      iconTrash.className = 'fa-solid fa-trash';
      iconTrash.addEventListener('click', () => {
        removeMessage(messageObject);
      });
      spanIcons.appendChild(iconTrash);
  
      divInfo.appendChild(spanIcons);
    }
  
    return divInfo;
  }
  
let selectedMessage = null;

buttons.btnsendEdit.addEventListener('click', async () => {
    let editPromise = await editMessage(selectedMessage);
    if (editPromise) {
        getMessages();
        inputs.inputEdit.value = '';
        containers.editContainer.classList.add('invisible');
    }
});

function createMessage(messageObject) {
    const divMain = document.createElement('div');
    const messagesChannels = document.createElement('section');
    const spanMessage = document.createElement('span');
    let divInfo = InfoElements(messageObject);
  
    messagesChannels.classList.add('messagesChannels');
  
    divMain.appendChild(divInfo);
  
    if (messageObject.deleted) {
      spanMessage.classList.add('removed');
      spanMessage.innerHTML = 'This message has been deleted';
    } else {
      spanMessage.innerText = messageObject.message;
    }
  
    if (messageObject.timeEdited) {
      const spanEdited = document.createElement('span');
      spanEdited.classList.add('edited');
      spanEdited.innerText = `Edit: ${messageObject.timeEdited}`;
      messagesChannels.appendChild(spanEdited);
    }
  
    messagesChannels.appendChild(spanMessage);
    divMain.appendChild(messagesChannels);
    containers.chatContainer.appendChild(divMain);
  }
  



export { containers, forms, buttons, inputs, state,newChannel, InfoElements, createMessage };