<template>
  <Page
    :class="[
      'w-full',
      'max-w-[640px]',
      'mt-[40px]',
      'mx-auto',
      'mb-[100px]',
    ]"
  >
    <div
      :class="[
        'flex',
        'justify-start',
        'mb-[4px]',
        'w-full'
      ]"
    >
      <Button
        class="text-dark-gray"
        :to="localeLocation({ name: 'index' })"
        preset="plain"
        tag="div"
        :text="$t('UploadForm.button.back')"
      >
        <template #prepend>
          <IconArrowLeft />
        </template>
      </Button>
    </div>
    <IscnUploadForm
      v-if="state === 'init'"
      :step="step"
      @submit="onSubmitUpload"
    />
    <IscnRegisterForm
      v-else-if="state === 'iscn'"
      :ipfs-hash="ipfsHash"
      :arweave-id="arweaveId"
      :file-data="fileData"
      :file-type="fileType"
      :file-size="fileSize"
      :file-s-h-a256="fileSHA256"
      :file-blob="fileBlob"
      :is-image="isImage"
      :exif-info="exifInfo"
      :step="step"
      @arweaveUploaded="onArweaveIdUpdate"
      @txBroadcasted="onISCNTxInfo"
      @handleSubmit="isSubmit = true"
      @handleQuit="isSubmit = false"
    />
    <IscnUploadedInfo
      v-else-if="state === 'done'"
      :owner="currentAddress"
      :iscn-id="iscnId"
      :iscn-hash="iscnTxHash"
      :record="record"
      :exif-info="exifInfo"
      :step="step"
    >
      <template #card-footer>
        <div
          :class="[
            'flex',
            'justify-center',
          ]"
        >
          <Button
            :class="[
              'mt-[16px]',
              'mb-[28px]',
            ]"
            preset="secondary"
            :text="$t('IscnUploaded.button.new')"
            @click="handleCreateAnotherButtonClick"
          >
            <template #prepend>
              <IconAddToISCN class="w-[20px]" />
            </template>
          </Button>
        </div>
      </template>
    </IscnUploadedInfo>
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import { logTrackerEvent } from '~/utils/logger';

const signerModule = namespace('signer')
const iscnModule = namespace('iscn')

export enum State {
  init = 'init',
  iscn = 'iscn',
  done = 'done',
}

@Component({
  layout: 'wallet',
})
export default class NewIndexPage extends Vue {
  @signerModule.Getter('getAddress') currentAddress!: string
  @iscnModule.Action queryISCNByAddress!: (
    arg0: string
  ) => ISCNRecordWithID[] | PromiseLike<ISCNRecordWithID[]>

  state = 'init'
  ipfsHash = ''
  arweaveId = ''
  fileSHA256 = ''
  fileData = ''
  fileType = ''
  fileSize = ''
  iscnId = ''
  iscnTxHash = ''
  iscnTimestamp = ''
  isImage = false
  fileBlob: Blob | null = null
  exifInfo: any | null = null
  isSubmit = false
  record: ISCNRecordWithID | null = null

  get step(): any {
    switch (this.state) {
      case State.init:
        return 1

      case State.iscn:
        return this.isSubmit ? 3 : 2

      case State.done:
        return 4

      default:
        return undefined
    }
  }

  onSubmitUpload({
    ipfsHash,
    arweaveId,
    fileData,
    fileSHA256,
    isImage,
    fileBlob,
    exifInfo,
    fileType,
    fileSize,
  }: {
    ipfsHash: string
    arweaveId: string
    fileData: string
    fileSHA256: string
    isImage: boolean
    fileBlob: Blob | null
    exifInfo: any
    fileType: string
    fileSize: string
  }) {
    this.ipfsHash = ipfsHash
    this.arweaveId = arweaveId
    this.fileData = fileData
    this.fileSHA256 = fileSHA256
    this.isImage = isImage
    this.fileBlob = fileBlob
    this.exifInfo = exifInfo
    this.fileType = fileType
    this.fileSize = fileSize
    this.state = 'iscn'
    logTrackerEvent(this, 'ISCNCreate', 'ISCNConfirmFile', this.fileType, 1);
  }

  onArweaveIdUpdate({ arweaveId }: { arweaveId: string }) {
    this.arweaveId = arweaveId
    logTrackerEvent(this, 'ISCNCreate', 'ISCNFileUploadToARSuccess', arweaveId, 1);
  }

  async onISCNTxInfo({
    txHash,
    iscnId,
    timestamp,
  }: {
    txHash: string
    iscnId: string
    timestamp: string
  }) {
    this.iscnTxHash = txHash
    this.iscnId = iscnId
    this.iscnTimestamp = timestamp
    this.state = 'done'
    const records = await this.queryISCNByAddress(this.currentAddress)
    this.record = records ? records[records.length - 1] : null
    logTrackerEvent(this, 'ISCNCreate', 'ISCNTxSuccess', this.iscnId, 1);
  }

  handleCreateAnotherButtonClick() {
    this.state = 'init'
    this.ipfsHash = ''
    this.arweaveId = ''
    this.fileSHA256 = ''
    this.fileData = ''
    this.fileType = ''
    this.fileSize = ''
    this.iscnId = ''
    this.iscnTxHash = ''
    this.iscnTimestamp = ''
    this.isImage = false
    this.fileBlob = null
    this.exifInfo = null
    this.isSubmit = false
    logTrackerEvent(this, 'ISCNCreate', 'CreateAnother', this.currentAddress, 1);
  }
}
</script>
