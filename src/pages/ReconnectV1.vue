<script setup>
/*
---- Log-in
1. loginRedirect.vue creates a session ID, asks the parent app's Auth SDK to store it. It's opaque.
2. When re-initializing, it discovers that 3PC is disabled, so LS and SS are unusable, it asks the host app to trigger a reconnection,
2. asks for the session ID from the host application and sends a URL to open a reconnection.
3a. The reconnect URL is stored and an event is triggered, the developer then has to call .reconnectContinue/.reconnectPopup()
3b. This will use the previously stored reconnect URL and open a popup.
4. The popup in its normal order of business will open its wallet UI iframe, and it'll communicate the private key back to the host app's wallet UI
4. through the interactWithIframe. Continues to Reconnection №1.

---- Reconnection
1. Get a session ID from the auth verify (the parent application)
2. Check if the session ID is expired, if it's expired, delete the private keys and return an error
3. Get the info from Local Storage & call contactParentPage
*/
</script>
