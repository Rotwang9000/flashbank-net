"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8895],{38895:function(e,t,i){i.r(t),i.d(t,{W3mEmailLoginView:function(){return A},W3mEmailOtpWidget:function(){return p.m},W3mEmailVerifyDeviceView:function(){return v},W3mEmailVerifyOtpView:function(){return h},W3mUpdateEmailPrimaryOtpView:function(){return $},W3mUpdateEmailSecondaryOtpView:function(){return R},W3mUpdateEmailWalletView:function(){return x}});var r=i(59757),o=i(29460),n=i(77500),a=i(51440),l=i(4511),s=i(83662),c=i(82879),u=i(83241),d=i(28740),p=i(19617);let h=class extends p.m{constructor(){super(...arguments),this.onOtpSubmit=async e=>{try{if(this.authConnector){let t=r.R.state.activeChain,i=o.ConnectionController.getConnections(t),u=n.OptionsController.state.remoteFeatures?.multiWallet,d=i.length>0;if(await this.authConnector.provider.connectOtp({otp:e}),a.X.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_PASS"}),t)await o.ConnectionController.connectExternal(this.authConnector,t);else throw Error("Active chain is not set on ChainControll");if(a.X.sendEvent({type:"track",event:"CONNECT_SUCCESS",properties:{method:"email",name:this.authConnector.name||"Unknown",view:l.RouterController.state.view,walletRank:void 0}}),n.OptionsController.state.remoteFeatures?.emailCapture)return;if(n.OptionsController.state.siwx){s.I.close();return}if(d&&u){l.RouterController.replace("ProfileWallets"),c.SnackController.showSuccess("New Wallet Added");return}s.I.close()}}catch(e){throw a.X.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_FAIL",properties:{message:u.j.parseError(e)}}),e}},this.onOtpResend=async e=>{this.authConnector&&(await this.authConnector.provider.connectEmail({email:e}),a.X.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_SENT"}))}}};h=function(e,t,i,r){var o,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a}([(0,d.Mo)("w3m-email-verify-otp-view")],h);var m=i(19064),f=i(59662),w=i(9793);i(82100),i(12441),i(69804),i(68390);var b=(0,d.iv)`
  wui-icon-box {
    height: ${({spacing:e})=>e["16"]};
    width: ${({spacing:e})=>e["16"]};
  }
`,y=function(e,t,i,r){var o,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let v=class extends m.oi{constructor(){super(),this.email=l.RouterController.state.data?.email,this.authConnector=w.ConnectorController.getAuthConnector(),this.loading=!1,this.listenForDeviceApproval()}render(){if(!this.email)throw Error("w3m-email-verify-device-view: No email provided");if(!this.authConnector)throw Error("w3m-email-verify-device-view: No auth connector provided");return(0,m.dy)`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["6","3","6","3"]}
        gap="4"
      >
        <wui-icon-box size="xl" color="accent-primary" icon="sealCheck"></wui-icon-box>

        <wui-flex flexDirection="column" alignItems="center" gap="3">
          <wui-flex flexDirection="column" alignItems="center">
            <wui-text variant="md-regular" color="primary">
              Approve the login link we sent to
            </wui-text>
            <wui-text variant="md-regular" color="primary"><b>${this.email}</b></wui-text>
          </wui-flex>

          <wui-text variant="sm-regular" color="secondary" align="center">
            The code expires in 20 minutes
          </wui-text>

          <wui-flex alignItems="center" id="w3m-resend-section" gap="2">
            <wui-text variant="sm-regular" color="primary" align="center">
              Didn't receive it?
            </wui-text>
            <wui-link @click=${this.onResendCode.bind(this)} .disabled=${this.loading}>
              Resend email
            </wui-link>
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}async listenForDeviceApproval(){if(this.authConnector)try{await this.authConnector.provider.connectDevice(),a.X.sendEvent({type:"track",event:"DEVICE_REGISTERED_FOR_EMAIL"}),a.X.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_SENT"}),l.RouterController.replace("EmailVerifyOtp",{email:this.email})}catch(e){l.RouterController.goBack()}}async onResendCode(){try{if(!this.loading){if(!this.authConnector||!this.email)throw Error("w3m-email-login-widget: Unable to resend email");this.loading=!0,await this.authConnector.provider.connectEmail({email:this.email}),this.listenForDeviceApproval(),c.SnackController.showSuccess("Code email resent")}}catch(e){c.SnackController.showError(e)}finally{this.loading=!1}}};v.styles=b,y([(0,f.SB)()],v.prototype,"loading",void 0),v=y([(0,d.Mo)("w3m-email-verify-device-view")],v);var g=i(30183);i(37826),i(6167);var E=(0,m.iv)`
  wui-email-input {
    width: 100%;
  }

  form {
    width: 100%;
    display: block;
    position: relative;
  }
`,C=function(e,t,i,r){var o,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let x=class extends m.oi{constructor(){super(...arguments),this.formRef=(0,g.V)(),this.initialEmail=l.RouterController.state.data?.email??"",this.redirectView=l.RouterController.state.data?.redirectView,this.email="",this.loading=!1}firstUpdated(){this.formRef.value?.addEventListener("keydown",e=>{"Enter"===e.key&&this.onSubmitEmail(e)})}render(){return(0,m.dy)`
      <wui-flex flexDirection="column" padding="4" gap="4">
        <form ${(0,g.i)(this.formRef)} @submit=${this.onSubmitEmail.bind(this)}>
          <wui-email-input
            value=${this.initialEmail}
            .disabled=${this.loading}
            @inputChange=${this.onEmailInputChange.bind(this)}
          >
          </wui-email-input>
          <input type="submit" hidden />
        </form>
        ${this.buttonsTemplate()}
      </wui-flex>
    `}onEmailInputChange(e){this.email=e.detail}async onSubmitEmail(e){try{if(this.loading)return;this.loading=!0,e.preventDefault();let t=w.ConnectorController.getAuthConnector();if(!t)throw Error("w3m-update-email-wallet: Auth connector not found");let i=await t.provider.updateEmail({email:this.email});a.X.sendEvent({type:"track",event:"EMAIL_EDIT"}),"VERIFY_SECONDARY_OTP"===i.action?l.RouterController.push("UpdateEmailSecondaryOtp",{email:this.initialEmail,newEmail:this.email,redirectView:this.redirectView}):l.RouterController.push("UpdateEmailPrimaryOtp",{email:this.initialEmail,newEmail:this.email,redirectView:this.redirectView})}catch(e){c.SnackController.showError(e),this.loading=!1}}buttonsTemplate(){let e=!this.loading&&this.email.length>3&&this.email!==this.initialEmail;return this.redirectView?(0,m.dy)`
      <wui-flex gap="3">
        <wui-button size="md" variant="neutral" fullWidth @click=${l.RouterController.goBack}>
          Cancel
        </wui-button>

        <wui-button
          size="md"
          variant="accent-primary"
          fullWidth
          @click=${this.onSubmitEmail.bind(this)}
          .disabled=${!e}
          .loading=${this.loading}
        >
          Save
        </wui-button>
      </wui-flex>
    `:(0,m.dy)`
        <wui-button
          size="md"
          variant="accent-primary"
          fullWidth
          @click=${this.onSubmitEmail.bind(this)}
          .disabled=${!e}
          .loading=${this.loading}
        >
          Save
        </wui-button>
      `}};x.styles=E,C([(0,f.SB)()],x.prototype,"email",void 0),C([(0,f.SB)()],x.prototype,"loading",void 0),x=C([(0,d.Mo)("w3m-update-email-wallet-view")],x);let $=class extends p.m{constructor(){super(),this.email=l.RouterController.state.data?.email,this.onOtpSubmit=async e=>{try{this.authConnector&&(await this.authConnector.provider.updateEmailPrimaryOtp({otp:e}),a.X.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_PASS"}),l.RouterController.replace("UpdateEmailSecondaryOtp",l.RouterController.state.data))}catch(e){throw a.X.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_FAIL",properties:{message:u.j.parseError(e)}}),e}},this.onStartOver=()=>{l.RouterController.replace("UpdateEmailWallet",l.RouterController.state.data)}}};$=function(e,t,i,r){var o,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a}([(0,d.Mo)("w3m-update-email-primary-otp-view")],$);let R=class extends p.m{constructor(){super(),this.email=l.RouterController.state.data?.newEmail,this.redirectView=l.RouterController.state.data?.redirectView,this.onOtpSubmit=async e=>{try{this.authConnector&&(await this.authConnector.provider.updateEmailSecondaryOtp({otp:e}),a.X.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_PASS"}),this.redirectView&&l.RouterController.reset(this.redirectView))}catch(e){throw a.X.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_FAIL",properties:{message:u.j.parseError(e)}}),e}},this.onStartOver=()=>{l.RouterController.replace("UpdateEmailWallet",l.RouterController.state.data)}}};R=function(e,t,i,r){var o,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a}([(0,d.Mo)("w3m-update-email-secondary-otp-view")],R);var O=i(68314),I=i(99013),k=function(e,t,i,r){var o,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let A=class extends m.oi{constructor(){super(),this.authConnector=w.ConnectorController.getAuthConnector(),this.isEmailEnabled=n.OptionsController.state.remoteFeatures?.email,this.isAuthEnabled=this.checkIfAuthEnabled(w.ConnectorController.state.connectors),this.connectors=w.ConnectorController.state.connectors,w.ConnectorController.subscribeKey("connectors",e=>{this.connectors=e,this.isAuthEnabled=this.checkIfAuthEnabled(this.connectors)})}render(){if(!this.isEmailEnabled)throw Error("w3m-email-login-view: Email is not enabled");if(!this.isAuthEnabled)throw Error("w3m-email-login-view: No auth connector provided");return(0,m.dy)`<wui-flex flexDirection="column" .padding=${["1","3","3","3"]} gap="4">
      <w3m-email-login-widget></w3m-email-login-widget>
    </wui-flex> `}checkIfAuthEnabled(e){let t=e.filter(e=>e.type===I.b.CONNECTOR_TYPE_AUTH).map(e=>e.chain);return O.b.AUTH_CONNECTOR_SUPPORTED_CHAINS.some(e=>t.includes(e))}};k([(0,f.SB)()],A.prototype,"connectors",void 0),A=k([(0,d.Mo)("w3m-email-login-view")],A)},6167:function(e,t,i){var r=i(19064),o=i(59662),n=i(35162);i(21927),i(79556);var a=i(24134),l=i(25729);i(72785);var s=(0,r.iv)`
  :host {
    position: relative;
    display: inline-block;
    width: 100%;
  }
`,c=function(e,t,i,r){var o,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let u=class extends r.oi{constructor(){super(...arguments),this.disabled=!1}render(){return(0,r.dy)`
      <wui-input-text
        type="email"
        placeholder="Email"
        icon="mail"
        size="lg"
        .disabled=${this.disabled}
        .value=${this.value}
        data-testid="wui-email-input"
        tabIdx=${(0,n.o)(this.tabIdx)}
      ></wui-input-text>
      ${this.templateError()}
    `}templateError(){return this.errorMessage?(0,r.dy)`<wui-text variant="sm-regular" color="error">${this.errorMessage}</wui-text>`:null}};u.styles=[a.ET,s],c([(0,o.Cb)()],u.prototype,"errorMessage",void 0),c([(0,o.Cb)({type:Boolean})],u.prototype,"disabled",void 0),c([(0,o.Cb)()],u.prototype,"value",void 0),c([(0,o.Cb)()],u.prototype,"tabIdx",void 0),c([(0,l.M)("wui-email-input")],u)},72785:function(e,t,i){var r=i(19064),o=i(59662),n=i(35162),a=i(30183);i(21927),i(79556);var l=i(24134),s=i(25729),c=i(95636),u=(0,c.iv)`
  :host {
    position: relative;
    width: 100%;
    display: inline-flex;
    flex-direction: column;
    gap: ${({spacing:e})=>e[3]};
    color: ${({tokens:e})=>e.theme.textPrimary};
    caret-color: ${({tokens:e})=>e.core.textAccentPrimary};
  }

  .wui-input-text-container {
    position: relative;
    display: flex;
  }

  input {
    width: 100%;
    border-radius: ${({borderRadius:e})=>e[4]};
    color: inherit;
    background: transparent;
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
    caret-color: ${({tokens:e})=>e.core.textAccentPrimary};
    padding: ${({spacing:e})=>e[3]} ${({spacing:e})=>e[3]}
      ${({spacing:e})=>e[3]} ${({spacing:e})=>e[10]};
    font-size: ${({textSize:e})=>e.large};
    line-height: ${({typography:e})=>e["lg-regular"].lineHeight};
    letter-spacing: ${({typography:e})=>e["lg-regular"].letterSpacing};
    font-weight: ${({fontWeight:e})=>e.regular};
    font-family: ${({fontFamily:e})=>e.regular};
  }

  input[data-size='lg'] {
    padding: ${({spacing:e})=>e[4]} ${({spacing:e})=>e[3]}
      ${({spacing:e})=>e[4]} ${({spacing:e})=>e[10]};
  }

  @media (hover: hover) and (pointer: fine) {
    input:hover:enabled {
      border: 1px solid ${({tokens:e})=>e.theme.borderSecondary};
    }
  }

  input:disabled {
    cursor: unset;
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
  }

  input::placeholder {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  input:focus:enabled {
    border: 1px solid ${({tokens:e})=>e.theme.borderSecondary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    -webkit-box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent040};
    -moz-box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent040};
    box-shadow: 0px 0px 0px 4px ${({tokens:e})=>e.core.foregroundAccent040};
  }

  div.wui-input-text-container:has(input:disabled) {
    opacity: 0.5;
  }

  wui-icon.wui-input-text-left-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    left: ${({spacing:e})=>e[4]};
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  button.wui-input-text-submit-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:e})=>e[3]};
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    border-radius: ${({borderRadius:e})=>e[2]};
    color: ${({tokens:e})=>e.core.textAccentPrimary};
  }

  button.wui-input-text-submit-button:disabled {
    opacity: 1;
  }

  button.wui-input-text-submit-button.loading wui-icon {
    animation: spin 1s linear infinite;
  }

  button.wui-input-text-submit-button:hover {
    background: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  input:has(+ .wui-input-text-submit-button) {
    padding-right: ${({spacing:e})=>e[12]};
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }

  input[type='search']::-webkit-search-decoration,
  input[type='search']::-webkit-search-cancel-button,
  input[type='search']::-webkit-search-results-button,
  input[type='search']::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }

  /* -- Keyframes --------------------------------------------------- */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`,d=function(e,t,i,r){var o,n=arguments.length,a=n<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,i,r);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(a=(n<3?o(a):n>3?o(t,i,a):o(t,i))||a);return n>3&&a&&Object.defineProperty(t,i,a),a};let p=class extends r.oi{constructor(){super(...arguments),this.inputElementRef=(0,a.V)(),this.disabled=!1,this.loading=!1,this.placeholder="",this.type="text",this.value="",this.size="md"}render(){return(0,r.dy)` <div class="wui-input-text-container">
        ${this.templateLeftIcon()}
        <input
          data-size=${this.size}
          ${(0,a.i)(this.inputElementRef)}
          data-testid="wui-input-text"
          type=${this.type}
          enterkeyhint=${(0,n.o)(this.enterKeyHint)}
          ?disabled=${this.disabled}
          placeholder=${this.placeholder}
          @input=${this.dispatchInputChangeEvent.bind(this)}
          @keydown=${this.onKeyDown}
          .value=${this.value||""}
        />
        ${this.templateSubmitButton()}
        <slot class="wui-input-text-slot"></slot>
      </div>
      ${this.templateError()} ${this.templateWarning()}`}templateLeftIcon(){return this.icon?(0,r.dy)`<wui-icon
        class="wui-input-text-left-icon"
        size="md"
        data-size=${this.size}
        color="inherit"
        name=${this.icon}
      ></wui-icon>`:null}templateSubmitButton(){return this.onSubmit?(0,r.dy)`<button
        class="wui-input-text-submit-button ${this.loading?"loading":""}"
        @click=${this.onSubmit?.bind(this)}
        ?disabled=${this.disabled||this.loading}
      >
        ${this.loading?(0,r.dy)`<wui-icon name="spinner" size="md"></wui-icon>`:(0,r.dy)`<wui-icon name="chevronRight" size="md"></wui-icon>`}
      </button>`:null}templateError(){return this.errorText?(0,r.dy)`<wui-text variant="sm-regular" color="error">${this.errorText}</wui-text>`:null}templateWarning(){return this.warningText?(0,r.dy)`<wui-text variant="sm-regular" color="warning">${this.warningText}</wui-text>`:null}dispatchInputChangeEvent(){this.dispatchEvent(new CustomEvent("inputChange",{detail:this.inputElementRef.value?.value,bubbles:!0,composed:!0}))}};p.styles=[l.ET,l.ZM,u],d([(0,o.Cb)()],p.prototype,"icon",void 0),d([(0,o.Cb)({type:Boolean})],p.prototype,"disabled",void 0),d([(0,o.Cb)({type:Boolean})],p.prototype,"loading",void 0),d([(0,o.Cb)()],p.prototype,"placeholder",void 0),d([(0,o.Cb)()],p.prototype,"type",void 0),d([(0,o.Cb)()],p.prototype,"value",void 0),d([(0,o.Cb)()],p.prototype,"errorText",void 0),d([(0,o.Cb)()],p.prototype,"warningText",void 0),d([(0,o.Cb)()],p.prototype,"onSubmit",void 0),d([(0,o.Cb)()],p.prototype,"size",void 0),d([(0,o.Cb)({attribute:!1})],p.prototype,"onKeyDown",void 0),d([(0,s.M)("wui-input-text")],p)}}]);