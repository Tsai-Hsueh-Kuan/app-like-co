<template>
  <button
    :class="[
      'block',
      'border-[4px]',
      'border-shade-gray',
      'hover:border-like-cyan',
      { 'hover:border-medium-gray': disabled },
      'rounded-[16px]',
      'p-[24px]',
      'group',
      'hover:bg-like-cyan-extralight',
      { 'hover:bg-shade-gray': disabled },
      'transition-colors',
      'cursor-pointer',
    ]"
    :title="title"
    @click="handleClick"
  >
    <Label
      :class="[
        'group-hover:text-like-green',
        { 'group-hover:text-dark-gray': disabled },
        'transition-colors',
      ]"
      preset="h4"
      :text="title"
    >
      <template #prepend>
        <IconKeplr v-if="type === 'keplr'" />
        <IconLikerLand v-else-if="type === 'likerland_app'" />
      </template>
    </Label>
    <Label
      class="mt-[12px]"
      :text="description"
    />
  </button>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { logTrackerEvent, updateSentryUser, setLoggerUser } from '~/utils/logger'

const signerModule = namespace('signer')
const walletModule = namespace('wallet')

@Component
export default class ConnectWalletButton extends Vue {
  @Prop(String) readonly type!: string
  @Prop({ default: false }) readonly disabled!: boolean

  @signerModule.Action updateSignerInfo!: (arg0: {
    signer: OfflineSigner | null
    address: string
  }) => void

  @walletModule.Getter('getWalletAddress') walletAddress!: string
  @walletModule.Getter('getSigner') signer!: OfflineSigner | null
  @walletModule.Action initKeplr!: () => Promise<boolean>
  @walletModule.Action initWalletConnect!: () => Promise<boolean>

  get title() {
    switch (this.type) {
      case 'keplr':
        return this.$t('ConnectWalletButton.keplr.title');

      case 'likerland_app':
        return this.$t('ConnectWalletButton.likerland_app.title');

      default:
        return '';
    }
  }

  get description() {
    switch (this.type) {
      case 'keplr':
        return this.$t('ConnectWalletButton.keplr.description');

      case 'likerland_app':
        return this.$t('ConnectWalletButton.likerland_app.description');

      default:
        return '';
    }
  }

  async handleClick() {
    if (this.disabled) return;
    this.$emit('click', this.type)
    switch (this.type) {
      case 'keplr':
        logTrackerEvent(this, 'General', 'ConnectKeplr', '', 1);
        await this.initKeplr();
        break;
      case 'likerland_app':
        logTrackerEvent(this, 'General', 'ConnectLikerLandApp', '', 1);
        await this.initWalletConnect();
        break;
      default:
        return;
    }
    this.updateSignerInfo({
      signer: this.signer,
      address: this.walletAddress,
    });
    setLoggerUser(this, { wallet: this.walletAddress });
    updateSentryUser(this, { wallet: this.walletAddress });
    logTrackerEvent(this, 'General', 'ConnectWalletSuccess', this.walletAddress, 1);
  }
}
</script>
