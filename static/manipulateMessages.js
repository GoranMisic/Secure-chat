import { getMessages } from './script.js';
import { state, inputs } from './index.js';
import { showErrorMessage } from './validation.js';

export async function createChannel() {
    const jwt = localStorage.getItem(state.JWT_KEY);
  
    const newChannel = {
      name: inputs.inputChannelName.value,
      private: inputs.checkBox.checked,
    };
  
    try {
      const response = await fetch('/api/private/', {
        method: 'POST',
        body: JSON.stringify(newChannel),
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
      });
  
      if (response.ok) {
        return true;
      } else {
        console.log(`Could not create channel. Status: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error(`Could not POST data to the server. Error message: ${error.message}`);
      showErrorMessage();
    }
  }
  

  export async function editMessage(messageObject) {
    const jwt = localStorage.getItem(state.JWT_KEY);
    const editedMessage = {
        name: state.activeChannel.name,
        message: inputs.inputEdit.value,
        user: state.loggedInUser.userName,
    };

    try {
        const response = await fetch(`/api/private/${messageObject.id}`, {
            method: 'PUT',
            body: JSON.stringify(editedMessage),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
            },
        });

        if (!response.ok) {
            console.log(`Couldn't edit. Status: ${response.status}`);
            return false;
        }

        return true;
    } catch (error) {
        console.log(`Couldn't PUT data to the server. Error message: ${error.message}`);
    }
}

export async function removeMessage(messageObject) {
    const jwt = localStorage.getItem(state.JWT_KEY);
    const deleteItem = {
      name: state.activeChannel.name,
      user: state.loggedInUser.userName,
    };
  
    try {
      const response = await fetch(`/api/private/${messageObject.id}`, {
        method: 'DELETE',
        body: JSON.stringify(deleteItem),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Couldn't remove. Status: ${response.status}`);
      }
  
      getMessages();
    } catch (error) {
      console.error(`Couldn't DELETE data from the server. Error message: ${error.message}`);
    }
  }
  



  




