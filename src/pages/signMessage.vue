<template>
  <div class="sign_message-container">
    <div class="sign_message-body">
      <div class="sign_message-title_container">
        <h1 class="sign_message-title">Sign Message</h1>
        <time class="sign_message-datetime">27 Jul 21, 7:21 pm</time>
      </div>
      <p class="sign_message-permission">
        DropBox.com requests your permission to perform the following action:
      </p>
      <p class="sign_message-text">Upload of XYZ.jpg</p>
      <button class="sign_message-view_info">
        View Advanced Information
        <img
          class="sign_message-arrow_icon"
          src="../assets/images/arrow_icon.png"
        />
      </button>
    </div>
    <div class="sign_message-footer">
      <p class="sign_message-info_text">
        You are not going to be charged!
        <img
          class="sign_message-info_icon"
          src="../assets/images/info_icon.png"
        />
      </p>
      <div class="sign_message-button_container">
        <button class="sign_message_button-reject">Reject</button>
        <button class="sign_message_button-approve">Approve</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SignMessage",
};
</script>

<style>
.sign_message-container {
  padding: 20px 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sign_message-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.sign_message-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 70px;
}

.sign_message-title_container {
  display: flex;
  align-items: baseline;
}

.sign_message-title {
  font-weight: 600;
  font-size: 20px;

  margin: 0;

  color: #101010;
  flex: 1;
}

.sign_message-datetime {
  font-weight: 300;
  font-size: 12px;

  color: #8d8d8d;
  flex: 1;
  text-align: right;
}

.sign_message-permission {
  font-weight: normal;
  font-size: 14px;
}

.sign_message-text {
  background: #eeeeee;
  font-weight: 600;
  font-size: 16px;
  padding: 30px 30px;
  color: #101010;
  border-radius: 10px;
  box-shadow: inset -1px -1px 1px rgba(255, 255, 255, 0.7),
    inset 1px 1px 2px rgba(174, 174, 192, 0.2);

  text-align: center;
}

.sign_message-view_info {
  font-weight: 600;
  font-size: 10px;

  border: none;
  outline: none;

  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sign_message-info_text {
  font-weight: normal;
  font-size: 10px;

  display: flex;
}

.sign_message-info_icon {
  height: 12.5px;
  width: 12.5px;
  margin-left: 6px;
}

.sign_message-arrow_icon {
  width: 7px;
  margin-left: 6px;
}

.sign_message-button_container {
  width: 100%;
  display: flex;
  justify-content: space-around;
}

.sign_message_button-reject,
.sign_message_button-approve {
  flex: 1;
  font-weight: 600;
  font-size: 14px;
  padding: 10px;
  border: 2px solid #101010;
  border-radius: 10px;
  text-transform: uppercase;
}

.sign_message_button-reject {
  margin-right: 5px;
}

.sign_message_button-approve {
  margin-left: 5px;
  background-color: #101010;
  text-transform: uppercase;
  color: #f7f7f7;
}
</style>
