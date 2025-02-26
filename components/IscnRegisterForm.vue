<template>
  <div
    :class="[
      'flex',
      'flex-col',
    ]"
  >
    <Card class="p-[32px]" :has-padding="false">
      <!-- header -->
      <IscnFormHeader :step="step" :total-step="4" />
      <!-- guide text -->
      <Label
        :text="$t('IscnRegisterForm.guide.review')"
        class="text-medium-gray my-[12px]"
      />
      <!-- review metadata -->
      <div
        :class="[
          'flex',
          'w-[584px]',
          'flex-row',
          'justify-start',
          'items-center',
          'p-[32px]',
          'mb-[12px]',
          'border-[2px]',
          'border-dashed',
          'border-shade-gray',
          'rounded-[12px]',
          'text-medium-gray',
        ]"
      >
        <Previewer :is-image="isImage" :file-data="fileData" />
        <div
          :class="[
            'flex',
            'flex-col',
          ]"
        >
          <div
            v-if="uploadStatus === 'Loading'"
            :class="[
              'flex',
              'items-center',
              'mb-[24px]',
            ]"
          >
            <ProgressIndicator />
            <div
              class="ml-[12px]"
              v-text="$t('IscnRegisterForm.label.uploading')"
            />
          </div>
          <Label
            v-else
            :class="[
              'w-min',
              'mb-[16px]',
            ]"
            :text="$t('IscnRegisterForm.title.ready')"
            tag="div"
            preset="p5"
            valign="middle"
            content-class="font-semibold whitespace-nowrap text-like-green"
            prepend-class="text-like-green"
          >
            <template #prepend>
              <IconDone />
            </template>
          </Label>
          <Button
            v-if="exifInfo"
            class="w-min"
            type="button"
            :text="$t('UploadForm.view.file.button')"
            preset="outline"
            @click="isOpenFileInfoDialog = true"
          >
            <template #prepend>
              <IconInfo />
            </template>
          </Button>
        </div>
      </div>
      <!-- fingerPrint -->
      <FormField
        :label="$t('IscnRegisterForm.label.fingerprints')"
        class="mb-[12px]"
      >
        <ContentFingerprintLink v-if="ipfsHash"  :item="formattedIpfs" />
        <ContentFingerprintLink v-if="uploadArweaveId" :item="formattedArweave" />
      </FormField>
      <!-- Numbers Protocol -->
      <FormField
        v-if="isPhoto || isImage"
        :label="$t('IscnRegisterForm.label.numbersProtocol')"
        class="mb-[12px]"
      >
        <CheckBox v-model="isRegisterNumbersProtocolAsset">
          <i18n path="IscnRegisterForm.label.numbersProtocol.details">
            <Link
              place="link"
              href="https://www.numbersprotocol.io/"
              :is-inline="true"
            >{{ $t('IscnRegisterForm.label.numbersProtocol.details.link') }}</Link>
          </i18n>
        </CheckBox>
      </FormField>
      <!-- Dialog -->
      <Dialog
        v-model="isOpenFileInfoDialog"
        :has-padding="false"
        preset="custom"
      >
        <MetadataCard
          :class="[
            'w-[616px]',
            'max-h-[75vh]',
            'overflow-y-scroll',
            'scrollbar-hidden',
          ]"
          :img-src="fileData"
          :all-exif="exifInfo"
        />
      </Dialog>
    </Card>
    <!-- ////// Input Card /////// -->
    <Card
      class="flex flex-col mt-[16px] p-[32px]"
      :has-padding="false"
    >
      <!-- header -->
      <Label
        class="w-min mb-[16px]"
        :text="type"
        tag="div"
        preset="p5"
        valign="middle"
        content-class="font-semibold whitespace-nowrap text-like-green"
        prepend-class="text-like-green"
      >
        <template #prepend>
          <ISCNTypeIcon :type="type" />
        </template>
      </Label>
      <!-- form fieldset -->
      <div>
        <form @submit.prevent="onSubmit">
          <FormField
            :label="$t('IscnRegisterForm.label.iscn')"
            class="my-[12px]"
          >
            <TextField
              v-model="name"
              :error-message="validateField(name, charactersLimit.name, true)"
              :placeholder="$t('IscnRegisterForm.placeholder.iscn')"
            />
          </FormField>
          <FormField
            :label="$t('IscnRegisterForm.label.description')"
            class="mb-[12px]"
          >
            <TextField
              v-model="description"
              :is-textarea="true"
              :error-message="validateField(description, charactersLimit.description, true)"
              :placeholder="$t('IscnRegisterForm.placeholder.description')"
            />
          </FormField>
          <FormField
            :label="$t('IscnRegisterForm.label.author')"
            content-classes="flex flex-row flex-wrap"
          >
            <!-- add author -->
            <span
              v-for="(author, index) in authors"
              :key="index"
              class="mr-[8px] mb-[4px]"
            >
              <Button
                size="mini"
                preset="secondary"
                tag="div"
                text-preset="h6"
                type="button"
                :text="author.name"
                @click="editAuthor(index)"
              />
            </span>
            <Button
              type="button"
              class="mb-[4px]"
              size="mini"
              preset="secondary"
              content-class="py-[4px]"
              @click="handleOpenAuthorDialog()"
            >
              <IconAddMini />
            </Button>
          </FormField>
          <!-- add tags -->
          <Divider class="my-[12px]" />
          <FormField
            :label="$t('IscnRegisterForm.label.tags')"
            content-classes="flex flex-row flex-wrap"
          >
            <EditableTagList
              v-model="tags"
              :characters-limit="charactersLimit.tagContent"
              :tags-limit="charactersLimit.tagNumber"
            />
          </FormField>
          <Divider class="my-[12px]" />
          <FormField
            :label="$t('IscnRegisterForm.label.url')"
            class="mb-[12px]"
          >
            <TextField
              v-model="url"
              :placeholder="$t('IscnRegisterForm.placeholder.url')"
            />
          </FormField>
          <FormField
            :label="$t('IscnRegisterForm.label.license')"
            class="mb-[12px]"
          >
            <TextField
              v-model="license"
              :error-message="validateField(license, charactersLimit.license)"
              :placeholder="$t('IscnRegisterForm.placeholder.license')"
            />
          </FormField>
          <Divider class="my-[12px]" />
          <!-- register -->
          <FormField
            :label="$t('IscnRegisterForm.label.registrant')"
            class="mb-[12px]"
          >
            <div class="font-normal text-[16px] leading-[22px]">
              {{ address }}
            </div>
          </FormField>
          <div class="flex flex-row justify-end pt-[24px] text-medium-gray">
            <Label :text="formattedRegisterFee" class="mx-[24px]" />
            <div v-if="uploadStatus === 'Loading'">
              <Button
                :text="$t('IscnRegisterForm.button.loading')"
                preset="outline"
                is-disabled=true
              >
                <template #append>
                  <IconArrowRight />
                </template>
              </Button>
            </div>
            <div
              v-else-if="uploadStatus"
              :class="[
                'flex',
                'flex-col',
                'items-end',
              ]"
            >
              <ProgressIndicator />
              <div
                :class="[
                  'text-[12px]',
                  'mt-[4px]',
                ]"
              >
                {{ formattedUploadStatus }}
              </div>
            </div>
            <Button
              v-else
              :text="$t('IscnRegisterForm.button.register')"
              type="submit"
              preset="secondary"
            >
              <template #append>
                <IconArrowRight />
              </template>
            </Button>
          </div>
        </form>
      </div>
      <!-- Snackbar -->
      <Snackbar
        v-model="isOpenWarningSnackbar"
        preset="warn"
      >
        {{ errorMsg }}
        <Link
          v-if="error === 'INSUFFICIENT_BALANCE'"
          :class="['text-white','ml-[2px]']"
          href="https://app.osmosis.zone/?from=UST&to=LIKE"
        >
          {{ $t('IscnRegisterForm.error.buy') }}
        </Link>
      </Snackbar>
      <!-- Dialog -->
      <Dialog
        v-model="isOpenAuthorDialog"
        :has-padding="false"
        preset="custom"
        :is-disabled-backdrop-click="true"
      >
        <Card
          :class="[
            'flex',
            'flex-col',
            'w-[616px]',
            'max-h-[75vh]',
            'pb-[80px]',
            'overflow-y-scroll',
            'scrollbar-hidden',
          ]"
        >
          <Label
            class="w-min mb-[16px]"
            :text="$t('IscnRegisterForm.title.editAuthor')"
            tag="div"
            preset="p5"
            valign="middle"
            content-class="font-semibold whitespace-nowrap text-like-green"
            prepend-class="text-like-green"
          >
            <template #prepend>
              <IconAdd />
            </template>
          </Label>
          <!-- name -->
          <FormField
            class="mb-[24px]"
            content-classes="flex flex-row flex-nowarp items-top"
            :label="$t('IscnRegisterForm.label.name')"
          >
            <TextField
              v-model="authorName"
              :error-message="validateField(authorName, charactersLimit.authorName, true)"
              :size="40"
              class="w-[219px]"
              :placeholder="$t('IscnRegisterForm.placeholder.name')"
            />
            <!-- hide for now -->
            <!-- <Selector
              class="h-[40px] w-[52px] ml-[8px]"
              @input="setAuthorName"
            /> -->
          </FormField>
          <FormField class="mb-[16px]" :label="$t('IscnRegisterForm.label.likerID')">
            <TextField
              v-model="likerId"
              :size="40"
              :error-message="validateField(likerId, charactersLimit.likerId, false, charactersLimit.likerIdLeast)"
              :placeholder="$t('IscnRegisterForm.placeholder.likerID')"
            />
          </FormField>
          <FormField
            :label="$t('IscnRegisterForm.label.description')"
            class="mb-[24px]"
          >
            <TextField
              v-model="authorDescription"
              :is-textarea="true"
              :error-message="validateField(authorDescription, charactersLimit.authorDescription)"
              :placeholder="$t('IscnRegisterForm.placeholder.description')"
            />
          </FormField>
          <!-- url -->
          <FormField class="mb-[24px]" :label="$t('IscnRegisterForm.label.url')">
            <TextFieldList
              v-model="authorUrl"
              :size="40"
              :text="$t('IscnRegisterForm.label.url')"
              :placeholder="$t('IscnRegisterForm.placeholder.url')"
            />
          </FormField>
          <!-- wallet address -->
          <FormField :label="$t('IscnRegisterForm.label.wallet')">
            <WalletFieldList
              v-model="authorWalletAddress"
            />
          </FormField>
          <!-- submit btn -->
          <div class="flex flex-row self-end">
            <Button
              type="button"
              size="small"
              preset="secondary"
              content-class="font-semibold"
              :text="$t('IscnRegisterForm.button.confirm')"
              @click.prevent="confirmAuthorChange"
            />
            <Button
              v-if="activeEditingAuthorIndex >= 0"
              class="ml-[8px]"
              type="button"
              size="small"
              preset="tertiary"
              @click="deleteAuthor"
            >
              <IconDelete />
            </Button>
          </div>
        </Card>
      </Dialog>
      <Dialog
        v-model="isOpenSignDialog"
        :header-text="signDialogHeaderText"
        :is-disabled-backdrop-click="true"
        :has-close-button="!isUploadingArweave"
        @close="handleSignDialogClose"
      >
        <template #header-prepend>
          <IconStar class="w-[20px]" />
        </template>
        <ProgressIndicator
          v-if="isUploadingArweave"
          class="mx-auto mb-[24px]"
        />
        <div class="text-center text-medium-gray text-[24px] font-500">{{ signDialogMessage }}</div>
        <pre
          v-if="signDialogError"
          :class="[
            'mt-[12px]',
            'p-[8px]',
            'bg-red',
            'bg-opacity-20',
            'rounded-[8px]',
            'text-red',
            'text-[12px]',
            'font-400',
          ]"
        >{{ signDialogError }}</pre>
        <div v-if="isUploadingArweave">
          <Divider class="mt-[12px] mb-[8px]" />
          <span
            v-t="'IscnRegisterForm.signDialog.sign.arweave.uploading'"
            class="whitespace-pre-line"
          />
        </div>
        <template v-if="!isUploadingArweave">
          <Divider class="my-[12px]" />
          <Label
            class="text-[14px] font-400"
            :text="`${signDialogFee} / ${totalFee}`"
          >
            <template #prepend>
              <span
                v-t="'IscnRegisterForm.signDialog.fee'"
                class="min-w-[64px] mr-[8px] text-[12px] text-medium-gray font-semibold"
              />
            </template>
          </Label>
          <div class="flex justify-center mt-[24px]">
            <Button
              :preset="buttonState.preset"
              :text="buttonState.text"
              :is-disabled="buttonState.isDisable"
              @click="onRetry"
            />
          </div>
        </template>
      </Dialog>
      <Dialog
        v-model="isOpenQuitAlertDialog"
        :header-text="$t('IscnRegisterForm.quitAlertDialog.title')"
        :is-disabled-backdrop-click="true"
        :has-close-button="false"
      >
        <div
          v-t="'IscnRegisterForm.quitAlertDialog.content'"
          class="max-w-[336px] text-center text-medium-gray text-[16px] font-500"
        />
        <div class="mx-auto mt-[24px] grid grid-flow-col gap-x-[12px] text-center">
          <Button
            preset="outline"
            class="text-red border-red hover:bg-red active:bg-red hover:bg-opacity-20 active:bg-opacity-30"
            :text="$t('IscnRegisterForm.quitAlertDialog.confirm')"
            @click="handleQuit"
          >
            <template #prepend>
              <IconBin v-if="isOpenQuitAlertDialog" class="w-[20px]" />
            </template>
          </Button>
          <Button
            preset="outline"
            :text="$t('IscnRegisterForm.quitAlertDialog.continue')"
            @click="handleContinue"
          />
        </div>
      </Dialog>
    </Card>
    <Snackbar
      v-model="shouldShowAlert"
      :text="errorMessage"
      preset="warn"
    />
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
import BigNumber from 'bignumber.js'
import debounce from 'lodash.debounce'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import { AxiosResponse } from 'axios'
import { Author } from '~/types/author'

import { signISCNTx } from '~/utils/cosmos/iscn';
import { DEFAULT_TRANSFER_FEE, sendLIKE } from '~/utils/cosmos/sign';
import { esimateISCNTxGasAndFee, formatISCNTxPayload } from '~/utils/cosmos/iscn/sign';
import {
  getLikerIdMinApi,
  API_POST_ARWEAVE_ESTIMATE,
  API_POST_ARWEAVE_UPLOAD,
  API_POST_NUMBERS_PROTOCOL_ASSETS,
  } from '~/constant/api';
import { getAccountBalance } from '~/utils/cosmos'
import { logTrackerEvent } from '~/utils/logger'

const signerModule = namespace('signer')

export enum CharactersLimit {
  name = 100,
  description = 200,
  tagContent = 35,
  tagNumber = 10,
  authorName = 40,
  authorDescription = 200,
  likerIdLeast = 7,
  likerId = 20,
  license = 200
}

@Component
export default class IscnRegisterForm extends Vue {
  @Prop({ default: false }) readonly isImage!: boolean
  @Prop({ default: null }) readonly exifInfo: any | null | undefined
  @Prop({ default: null }) readonly fileBlob: Blob | null | undefined
  @Prop({ default: null }) readonly fileData: string | null | undefined
  @Prop({ default: null }) readonly fileType: string | null | undefined
  @Prop({ default: null }) readonly fileSize: string | null | undefined
  @Prop(String) readonly fileSHA256!: string
  @Prop({ default: false }) readonly isIPFSLink!: boolean
  @Prop(String) readonly ipfsHash!: string
  @Prop(String) readonly arweaveId!: string
  @Prop(Number) readonly step: number | undefined

  @signerModule.Getter('getAddress') address!: string
  @signerModule.Getter('getSigner') signer!: OfflineSigner | null

  authors: Author[] = []
  name: string = ''
  description: string = ''
  tags: string[] = []
  url: string = ''
  license: string = ''
  authorName: string = ''
  authorUrl: string[] = []
  authorWalletAddress: string[] = []
  uploadStatus: string = ''
  uploadIpfsHash: string = this.ipfsHash || ''
  uploadArweaveId: string = this.arweaveId || ''
  error: string = ''
  likerId: string = ''
  likerIdsAddresses: (string | void)[] = []
  authorDescription: string = ''

  arweaveFeeTargetAddress: string = ''
  arweaveFee = new BigNumber(0)
  iscnFee = new BigNumber(0)
  balance = new BigNumber(0)
  debouncedCalculateISCNFee = debounce(this.calculateISCNFee, 400)

  isRegisterNumbersProtocolAsset = false
  numbersProtocolAssetId = ''

  isOpenFileInfoDialog = false
  isOpenAuthorDialog = false
  isOpenWarningSnackbar = false
  isOpenKeplr = true
  activeEditingAuthorIndex = -1

  isOpenSignDialog = false
  isOpenQuitAlertDialog = false
  isUploadingArweave = false
  signDialogError = ''
  shouldShowAlert = false
  errorMessage = ''

  checkedAuthorInfo = false
  isChecked = false
  charactersLimit = CharactersLimit

  get tagsString(): string {
    return this.tags.join(',')
  }

  get authorNames() {
    return this.authors.map((a) => a.name)
  }

  get authorUrls() {
    return this.authors.map((a) => a.url.map((b: any) => b.content))
  }

  get authorWalletAddresses() {
    return this.authors.map((a) =>
      a.wallet.map((b: any) => ({ address: b.content, type: b.type })),
    )
  }

  get likerIds() {
    return this.authors.map((a) => a.likerId)
  }

  get descriptions() {
    return this.authors.map((a) => a.authorDescription)
  }

  get isPhoto() {
    return this.exifInfo && this.exifInfo.ExifImageWidth
  }

  get type() {
    if (this.isPhoto) return 'Photo'
    if (this.isImage) return 'Image'
    return 'CreativeWork'
  }

  get formattedIpfs() {
    return this.$t('IscnRegisterForm.ipfs.link', { hash: this.ipfsHash })
  }

  get formattedArweave() {
    return this.$t('IscnRegisterForm.arweave.link', { arweaveId: this.uploadArweaveId })
  }

  get errorMsg() {
    switch (this.error) {
      case 'INSUFFICIENT_BALANCE':
        return this.$t('IscnRegisterForm.error.insufficient')
      case 'MISSING_SIGNER':
        return this.$t('IscnRegisterForm.error.missingSigner')
      default:
        return ''
    }
  }

  get formattedUploadStatus() {
    switch (this.uploadStatus) {
      case 'loading':
        return this.$t('IscnRegisterForm.button.loading')

      case 'signing':
        return this.$t('IscnRegisterForm.button.signing')

      case 'uploading':
        return this.$t('IscnRegisterForm.button.uploading')

      case 'success':
        return this.$t('IscnRegisterForm.button.success')

      default:
        return this.$t('IscnRegisterForm.button.register')
    }
  }

  get formattedRegisterFee() {
    return this.$t('IscnRegisterForm.register.fee', { fee: this.totalFee })
  }

  get exif() {
    const extension = this.fileType!.split('/')
    return this.exifInfo
      ? {
          ...this.exifInfo,
          Format: this.fileType,
          Size:
            this.exifInfo.ExifImageHeight && this.exifInfo.ExifImageWidth
              ? `${this.exifInfo.ExifImageHeight} x ${
                  this.exifInfo.ExifImageWidth
                } ${extension[extension.length - 1].toUpperCase()} (${
                  this.fileSize
                })`
              : this.fileSize,
        }
      : {
          Format: this.fileType,
          Size: this.fileSize,
        }
  }

  get payload() {
    return {
      type: this.type,
      name: this.name,
      description: this.description,
      tagsString: this.tagsString,
      url: this.url,
      exifInfo: this.exif,
      license: this.license,
      ipfsHash: this.uploadIpfsHash || this.ipfsHash,
      arweaveId: this.uploadArweaveId || this.arweaveId,
      numbersProtocolAssetId: this.numbersProtocolAssetId,
      fileSHA256: this.fileSHA256,
      authorNames: this.authorNames,
      authorUrls: this.authorUrls,
      authorWallets: this.authorWalletAddresses,
      likerIds: this.likerIds,
      likerIdsAddresses: this.likerIdsAddresses,
      descriptions: this.descriptions,
    }
  }

  get arweaveFeePlusGas() {
    if (this.arweaveFee.lte(0)) return this.arweaveFee;
    const gasAmount = new BigNumber(DEFAULT_TRANSFER_FEE.amount[0].amount).shiftedBy(-9);
    return this.arweaveFee.plus(gasAmount);
  }

  get totalFee() {
    return this.iscnFee.plus(this.arweaveFeePlusGas)
  }

  get currentSignStep() {
    if (this.arweaveFee.lte(0)) {
      return 1;
    }
    return this.uploadArweaveId ? 2 : 1;
  }

  get totalSignStep() {
    if (this.uploadArweaveId && this.arweaveFee.lte(0)) return 1
    return 2;
  }

  get signDialogHeaderText() {
    if (this.isUploadingArweave) return this.$t('IscnRegisterForm.button.uploading')
    return `Sign (${this.currentSignStep}/${ this.totalSignStep})`
  }

  get signDialogMessage() {
    if (this.isUploadingArweave) {
      return this.$t('IscnRegisterForm.signDialog.closeWarning')
    }
    if (this.uploadArweaveId) {
      return this.$t('IscnRegisterForm.signDialog.sign.iscn.register');
    }
    return this.$t('IscnRegisterForm.signDialog.sign.arweave.upload');
  }

  get signDialogFee() {
    if (this.uploadArweaveId) return this.iscnFee;
    return this.arweaveFeePlusGas;
  }

  get buttonState() {
    return {
      preset:this.isOpenKeplr ? 'tertiary' : 'outline',
      text: this.isOpenKeplr
      ? this.$t('IscnRegisterForm.signDialog.keplr')
      : this.$t('IscnRegisterForm.signDialog.retry'),
      isDisable: this.isOpenKeplr,
    }
  }

  get isMetadataReady() {
    return (
      this.name &&
      this.description &&
      this.name.length <= CharactersLimit.name &&
      this.description.length <= CharactersLimit.description &&
      this.license.length <= CharactersLimit.license
    )
  }

  @Watch('payload', { immediate: true, deep: true })
  change() {
    this.debouncedCalculateISCNFee()
  }

  @Watch('error')
  showWarning(errormsg: any) {
    if (errormsg) this.isOpenWarningSnackbar = true
  }

  async mounted() {
    this.uploadStatus = 'Loading'
    await this.estimateArweaveFee();
    // ISCN Fee needs Arweave fee to calculate
    await this.calculateISCNFee()
    this.uploadStatus = ''
  }

  handleOpenAuthorDialog() {
    logTrackerEvent(this, 'ISCNCreate', 'OpenAuthorDialog', '', 1);
    this.checkedAuthorInfo = false
    this.isOpenAuthorDialog = true
    this.initAuthorInfo()
  }

  editAuthor(index: number) {
    logTrackerEvent(this, 'ISCNCreate', 'EditAuthor', index.toString(), 1);
    const { name, wallet, url, likerId, authorDescription } =
      this.authors[index]
    this.authorName = name
    this.authorWalletAddress = wallet
    this.authorUrl = url
    this.likerId = likerId
    this.authorDescription = authorDescription
    this.activeEditingAuthorIndex = index
    this.isOpenAuthorDialog = true
  }

  dismissAuthorDialog() {
    this.isOpenAuthorDialog = false
    this.activeEditingAuthorIndex = -1
    this.authorName = ''
    this.authorUrl = []
    this.authorWalletAddress = []
    this.likerId = ''
    this.authorDescription = ''
  }

  deleteAuthor() {
    this.authors.splice(this.activeEditingAuthorIndex, 1)
    this.dismissAuthorDialog()
  }

  confirmAuthorChange() {
    logTrackerEvent(this, 'ISCNCreate', 'ConfirmAuthorChange', '', 1);
    this.checkedAuthorInfo = true
    if (!this.authorName || this.authorName.length > CharactersLimit.authorName)
      return
    if (
      this.likerId &&
      (this.likerId.length < CharactersLimit.likerIdLeast ||
        this.likerId.length > CharactersLimit.likerId)
    )
      return
    this.authorWalletAddress.forEach((a: any, i: number) => {
      if (!a.content) {
        this.authorWalletAddress.splice(i, 1)
      }
    })
    const newAuthor = {
      name: this.authorName,
      wallet: this.authorWalletAddress,
      url: this.authorUrl,
      likerId: this.likerId,
      authorDescription: this.authorDescription,
    }
    if (this.activeEditingAuthorIndex >= 0) {
      this.authors.splice(this.activeEditingAuthorIndex, 1, newAuthor)
    } else {
      this.authors.push(newAuthor)
    }
    this.dismissAuthorDialog()
  }

  initAuthorInfo() {
    this.authorName = ''
    this.authorWalletAddress = []
    this.authorUrl = []
    this.likerId = ''
    this.authorDescription = ''
    this.activeEditingAuthorIndex = -1
  }

  setAuthorName(value: string) {
    this.authorName = value
  }

  async getLikerIdsAddresses(): Promise<void> {
    try {
      this.likerIdsAddresses = await Promise.all(
        this.likerIds.map((e) =>
          this.$axios.get(getLikerIdMinApi(e as string))
          .then((element: AxiosResponse): string | undefined => element?.data?.likeWallet)
          .catch(()=>{}),
        ),
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }

  async calculateISCNFee(): Promise<void> {
    const [
      balance,
      estimation,
    ] = await Promise.all([
      getAccountBalance(this.address),
      esimateISCNTxGasAndFee(formatISCNTxPayload(this.payload)),
    ])
    this.balance = new BigNumber(balance);
    const { iscnFee, gas: iscnGasEstimation } = estimation;
    const iscnGasNanolike = iscnGasEstimation.fee.amount[0].amount
    const iscnFeeNanolike = iscnFee.amount
    this.iscnFee =  new BigNumber(iscnFeeNanolike)
      .plus(iscnGasNanolike)
      .shiftedBy(-9);
  }

  handleSignDialogClose() {
    logTrackerEvent(this, 'ISCNCreate', 'CloseSignDialog', '', 1);
    this.isOpenQuitAlertDialog = true
  }

  handleContinue() {
    logTrackerEvent(this, 'ISCNCreate', 'ContinueDialog', '', 1);
    this.isOpenQuitAlertDialog = false
    this.isOpenSignDialog = true
    this.onRetry()
  }

  handleQuit() {
    logTrackerEvent(this, 'ISCNCreate', 'QuitDialog', '', 1);
    this.isOpenQuitAlertDialog = false
    this.uploadStatus = ''
    this.$emit('handleQuit')
  }

  onRetry(): Promise<void> {
    logTrackerEvent(this, 'ISCNCreate', 'RetryDialog', '', 1);
    this.shouldShowAlert = false
    this.signDialogError = ''
    this.onOpenKeplr()
    return this.onSubmit();
  }

  onOpenKeplr() {
    logTrackerEvent(this, 'ISCNCreate', 'OpenKeplr', '', 1);
    this.isOpenKeplr = true
    setTimeout(() => {
      this.isOpenKeplr = false
    }, 5000)
  }

  validateField(
    val: any,
    limit: number,
    required: boolean = false,
    least: number = 0,
  ) {
    if (required && !val && (this.isChecked || this.checkedAuthorInfo)) {
      return this.$t('IscnRegisterForm.error.requiredField')
    }
    if (val && val.length > limit) {
      return this.$t('IscnRegisterForm.warning.exceeded', {
        current: val.length,
        limit,
      })
    }
    if (val && least > 0 && val.length < least) {
      return this.$t('IscnRegisterForm.warning.shortage', {
        least,
      })
    }
    return undefined
  }

  async onSubmit(): Promise<void> {
    logTrackerEvent(this, 'ISCNCreate', 'ClickSubmit', '', 1);
    await this.getLikerIdsAddresses()
    this.$emit('handleSubmit')
    this.isChecked = true
    if (!this.isMetadataReady) return
    this.error = ''
    this.signDialogError = ''
    if (this.balance.lt(this.totalFee)) {
      this.error = 'INSUFFICIENT_BALANCE'
      this.isOpenWarningSnackbar = true
      this.uploadStatus = ''
      return
    }
    await this.submitToArweave();
    if (this.isRegisterNumbersProtocolAsset && !this.numbersProtocolAssetId) {
      await this.submitToNumbers();
    }
    if (this.uploadArweaveId) await this.submitToISCN()
  }

  async estimateArweaveFee(): Promise<void> {
    const formData = new FormData();
    if (this.fileBlob) formData.append('file', this.fileBlob);
    try {
      const { address, arweaveId, LIKE } = await this.$axios.$post(
        API_POST_ARWEAVE_ESTIMATE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      this.uploadArweaveId = arweaveId;
      if (LIKE) this.arweaveFee = new BigNumber(LIKE);
      this.arweaveFeeTargetAddress = address;
    } catch (err) {
      // TODO: Handle error
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  async sendArweaveFeeTx(): Promise<string> {
    logTrackerEvent(this, 'ISCNCreate', 'SendArFeeTx', '', 1);
    if (!this.signer) throw new Error('SIGNER_NOT_INITED');
    if (!this.arweaveFeeTargetAddress) throw new Error('TARGET_ADDRESS_NOT_SET');
    this.uploadStatus = 'signing';
    const memo = JSON.stringify({ ipfs: this.ipfsHash });
    try {
      const { transactionHash } = await sendLIKE(this.address, this.arweaveFeeTargetAddress, this.arweaveFee.toFixed(), this.signer, memo);
      return transactionHash;
    } catch (err) {
      this.signDialogError = 'TX_NO_SUCCESS';
      // TODO: Handle error
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      this.uploadStatus = '';
    }
    return '';
  }

  async submitToArweave(): Promise<void> {
    logTrackerEvent(this, 'ISCNCreate', 'SubmitToArweave', '', 1);
    if (this.uploadArweaveId) return;
    this.isOpenSignDialog = true;
    this.onOpenKeplr();
    const transactionHash = await this.sendArweaveFeeTx();
    const formData = new FormData();
    if (this.fileBlob) formData.append('file', this.fileBlob);
    // Register Numbers Protocol assets along with Arweave
    if (this.isRegisterNumbersProtocolAsset) {
      logTrackerEvent(this, 'ISCNCreate', 'SubmitToNumbers', '', 1);
      formData.append('num', '1')
    }
    this.isUploadingArweave = true;
    try {
      const {
        arweaveId,
        numAssetIds: [numbersProtocolAssetId],
      } = await this.$axios.$post(
        `${API_POST_ARWEAVE_UPLOAD}?txHash=${transactionHash}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      if (arweaveId) {
        this.uploadArweaveId = arweaveId
        this.numbersProtocolAssetId = numbersProtocolAssetId
        this.$emit('arweaveUploaded', { arweaveId, numbersProtocolAssetId })
        this.isOpenSignDialog = false
      } else {
        this.shouldShowAlert = true
        this.errorMessage = this.$t('IscnRegisterForm.error.arweave') as string
        this.$emit('handleContinue')
      }
    } catch (err) {
      // TODO: Handle error
      // eslint-disable-next-line no-console
      console.error(err)
      this.shouldShowAlert = true
      this.errorMessage = this.$t('IscnRegisterForm.error.arweave') as string
    } finally {
      this.isUploadingArweave = false;
      this.uploadStatus = '';
    }
  }

  async submitToNumbers(): Promise<void> {
    logTrackerEvent(this, 'ISCNCreate', 'SubmitToNumbers', '', 1);
    this.isOpenSignDialog = true;
    try {
      const formData = new FormData();
      if (this.fileBlob) formData.append('file', this.fileBlob);
      const {
        numAssetIds: [numbersProtocolAssetId],
      } = await this.$axios.$post(
        `${API_POST_NUMBERS_PROTOCOL_ASSETS}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      this.numbersProtocolAssetId = numbersProtocolAssetId
      this.$emit('numbers-protocol-registed', { numbersProtocolAssetId })
      this.isOpenSignDialog = false;
    } catch (error) {
      this.shouldShowAlert = true;
      this.errorMessage = this.$t('IscnRegisterForm.error.numbersProtocol') as string
    } finally {
      this.uploadStatus = '';
    }
  }

  async submitToISCN(): Promise<void> {
    logTrackerEvent(this, 'ISCNCreate', 'SubmitToISCN', '', 1);
    this.isOpenSignDialog = true;
    this.uploadStatus = 'loading'
    this.onOpenKeplr()
    await this.calculateISCNFee()
    if (this.balance.lt(this.iscnFee)) {
      this.error = 'INSUFFICIENT_BALANCE'
      this.uploadStatus = ''
      return
    }
    if (!this.signer) {
      this.error = 'MISSING_SIGNER'
      this.uploadStatus = ''
      return
    }
    try {
      const res = await signISCNTx(formatISCNTxPayload(this.payload), this.signer, this.address)
      this.uploadStatus = 'success'
      this.$emit('txBroadcasted', res)
      this.isOpenSignDialog = false;
    } catch (err) {
      this.signDialogError = err as string;
      this.uploadStatus = '';
      // TODO: Handle error
      // eslint-disable-next-line no-console
      console.error(err)
    } finally {
      this.isOpenQuitAlertDialog = false;
    }
  }
}
</script>
