<template>
  <div class="info__container">
    <p class="info__content">
      What you are about to do is simply sign a transaction and send it to the
      network from where it will be submitted to the public blockchain. You will
      never pay a fee to sign transactions.
    </p>
  </div>
</template>

<style scoped>
.info__container {
  width: 80%;
  padding: 1rem;
  margin: auto;
  background-color: #353535;
  border-radius: 5px;
}

@media (max-width: 235px) {
  .info__container {
    width: 90%;
  }
}

.info__content {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--color-light);
}
</style>
