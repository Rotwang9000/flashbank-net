"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[615],{88686:function(e,t,o){o.d(t,{M:function(){return s}});var i=o(86949),r=o(73932);let n=(0,i.sj)({isLegalCheckboxChecked:!1}),s={state:n,subscribe:e=>(0,i.Ld)(n,()=>e(n)),subscribeKey:(e,t)=>(0,r.VW)(n,e,t),setIsLegalCheckboxChecked(e){n.isLegalCheckboxChecked=e}}},1181:function(e,t,o){o.d(t,{y0:function(){return b}});var i=o(68314),r=o(83966),n=o(59757),s=o(9793),a=o(51440),c=o(4511),l=o(82879),d=o(83241),u=o(64125);async function h(){c.RouterController.push("ConnectingFarcaster");let e=s.ConnectorController.getAuthConnector();if(e&&!r.AccountController.state.farcasterUrl)try{let{url:t}=await e.provider.getFarcasterUri();r.AccountController.setFarcasterUrl(t,n.R.state.activeChain)}catch(e){c.RouterController.goBack(),l.SnackController.showError(e)}}async function p(e){c.RouterController.push("ConnectingSocial");let t=s.ConnectorController.getAuthConnector(),o=null;try{let s=setTimeout(()=>{throw Error("Social login timed out. Please try again.")},45e3);if(t&&e){if(d.j.isTelegram()||(o=function(){try{return d.j.returnOpenHref(`${i.b.SECURE_SITE_SDK_ORIGIN}/loading`,"popupWindow","width=600,height=800,scrollbars=yes")}catch(e){throw Error("Could not open social popup")}}()),o)r.AccountController.setSocialWindow(o,n.R.state.activeChain);else if(!d.j.isTelegram())throw Error("Could not create social popup");let{uri:a}=await t.provider.getSocialRedirectUri({provider:e});if(!a)throw o?.close(),Error("Could not fetch the social redirect uri");if(o&&(o.location.href=a),d.j.isTelegram()){u.M.setTelegramSocialProvider(e);let t=d.j.formatTelegramSocialLoginUrl(a);d.j.openHref(t,"_top")}clearTimeout(s)}}catch(e){o?.close(),l.SnackController.showError(e?.message)}}async function b(e){r.AccountController.setSocialProvider(e,n.R.state.activeChain),a.X.sendEvent({type:"track",event:"SOCIAL_LOGIN_STARTED",properties:{provider:e}}),"farcaster"===e?await h():await p(e)}},20615:function(e,t,o){o.r(t),o.d(t,{W3mConnectSocialsView:function(){return C},W3mConnectingFarcasterView:function(){return B},W3mConnectingSocialView:function(){return A}});var i=o(19064),r=o(59662),n=o(35162),s=o(88686),a=o(77500),c=o(28740);o(82100),o(27912);var l=o(9793),d=o(4511),u=o(47205),h=o(56008),p=o(1181),b=o(83241);o(75022);var g=o(84252),f=(0,c.iv)`
  :host {
    margin-top: ${({spacing:e})=>e["1"]};
  }
  wui-separator {
    margin: ${({spacing:e})=>e["3"]} calc(${({spacing:e})=>e["3"]} * -1)
      ${({spacing:e})=>e["2"]} calc(${({spacing:e})=>e["3"]} * -1);
    width: calc(100% + ${({spacing:e})=>e["3"]} * 2);
  }
`,w=function(e,t,o,i){var r,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,i);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(s=(n<3?r(s):n>3?r(t,o,s):r(t,o))||s);return n>3&&s&&Object.defineProperty(t,o,s),s};let m=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=l.ConnectorController.state.connectors,this.authConnector=this.connectors.find(e=>"AUTH"===e.type),this.remoteFeatures=a.OptionsController.state.remoteFeatures,this.isPwaLoading=!1,this.unsubscribe.push(l.ConnectorController.subscribeKey("connectors",e=>{this.connectors=e,this.authConnector=this.connectors.find(e=>"AUTH"===e.type)}),a.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e))}connectedCallback(){super.connectedCallback(),this.handlePwaFrameLoad()}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.remoteFeatures?.socials||[],t=!!this.authConnector,o=e?.length,r="ConnectSocials"===d.RouterController.state.view;return t&&o||r?(r&&!o&&(e=u.bq.DEFAULT_SOCIALS),(0,i.dy)` <wui-flex flexDirection="column" gap="2">
      ${e.map(e=>(0,i.dy)`<wui-list-social
            @click=${()=>{this.onSocialClick(e)}}
            data-testid=${`social-selector-${e}`}
            name=${e}
            logo=${e}
            ?disabled=${this.isPwaLoading}
          ></wui-list-social>`)}
    </wui-flex>`):null}async onSocialClick(e){e&&await (0,p.y0)(e)}async handlePwaFrameLoad(){if(b.j.isPWA()){this.isPwaLoading=!0;try{this.authConnector?.provider instanceof g.S&&await this.authConnector.provider.init()}catch(e){h.AlertController.open({displayMessage:"Error loading embedded wallet in PWA",debugMessage:e.message},"error")}finally{this.isPwaLoading=!1}}}};m.styles=f,w([(0,r.Cb)()],m.prototype,"tabIdx",void 0),w([(0,r.SB)()],m.prototype,"connectors",void 0),w([(0,r.SB)()],m.prototype,"authConnector",void 0),w([(0,r.SB)()],m.prototype,"remoteFeatures",void 0),w([(0,r.SB)()],m.prototype,"isPwaLoading",void 0),m=w([(0,c.Mo)("w3m-social-login-list")],m);var y=(0,c.iv)`
  wui-flex {
    max-height: clamp(360px, 540px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    transition: opacity ${({durations:e})=>e.md}
      ${({easings:e})=>e["ease-out-power-1"]};
    will-change: opacity;
  }

  wui-flex::-webkit-scrollbar {
    display: none;
  }

  wui-flex.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }
`,v=function(e,t,o,i){var r,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,i);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(s=(n<3?r(s):n>3?r(t,o,s):r(t,o))||s);return n>3&&s&&Object.defineProperty(t,o,s),s};let C=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.checked=s.M.state.isLegalCheckboxChecked,this.unsubscribe.push(s.M.subscribeKey("isLegalCheckboxChecked",e=>{this.checked=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=a.OptionsController.state,o=a.OptionsController.state.features?.legalCheckbox,r=!!(e||t)&&!!o&&!this.checked;return(0,i.dy)`
      <w3m-legal-checkbox></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${["0","3","3","3"]}
        gap="01"
        class=${(0,n.o)(r?"disabled":void 0)}
      >
        <w3m-social-login-list tabIdx=${(0,n.o)(r?-1:void 0)}></w3m-social-login-list>
      </wui-flex>
    `}};C.styles=y,v([(0,r.SB)()],C.prototype,"checked",void 0),C=v([(0,c.Mo)("w3m-connect-socials-view")],C);var x=o(83966),k=o(29460),$=o(59757),S=o(51440),R=o(64125),P=o(82879),O=o(83662),E=o(12858);o(12441),o(7013),o(51880),o(68390);var T=o(9681),j=o(72134),I=(0,c.iv)`
  wui-logo {
    width: 80px;
    height: 80px;
    border-radius: ${({borderRadius:e})=>e["8"]};
  }
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }
  wui-flex:first-child:not(:only-child) {
    position: relative;
  }
  wui-loading-thumbnail {
    position: absolute;
  }
  wui-icon-box {
    position: absolute;
    right: calc(${({spacing:e})=>e["1"]} * -1);
    bottom: calc(${({spacing:e})=>e["1"]} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition: all ${({easings:e})=>e["ease-out-power-2"]}
      ${({durations:e})=>e.lg};
  }
  wui-text[align='center'] {
    width: 100%;
    padding: 0px ${({spacing:e})=>e["4"]};
  }
  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }
  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms ${({easings:e})=>e["ease-out-power-2"]} both;
  }
  .capitalize {
    text-transform: capitalize;
  }
`,L=function(e,t,o,i){var r,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,i);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(s=(n<3?r(s):n>3?r(t,o,s):r(t,o))||s);return n>3&&s&&Object.defineProperty(t,o,s),s};let A=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.socialProvider=x.AccountController.state.socialProvider,this.socialWindow=x.AccountController.state.socialWindow,this.error=!1,this.connecting=!1,this.message="Connect in the provider window",this.remoteFeatures=a.OptionsController.state.remoteFeatures,this.address=x.AccountController.state.address,this.connectionsByNamespace=k.ConnectionController.getConnections($.R.state.activeChain),this.hasMultipleConnections=this.connectionsByNamespace.length>0,this.authConnector=l.ConnectorController.getAuthConnector(),this.handleSocialConnection=async e=>{if(e.data?.resultUri){if(e.origin===j.b.SECURE_SITE_ORIGIN){window.removeEventListener("message",this.handleSocialConnection,!1);try{if(this.authConnector&&!this.connecting){this.socialWindow&&(this.socialWindow.close(),x.AccountController.setSocialWindow(void 0,$.R.state.activeChain)),this.connecting=!0,this.updateMessage();let t=e.data.resultUri;this.socialProvider&&S.X.sendEvent({type:"track",event:"SOCIAL_LOGIN_REQUEST_USER_DATA",properties:{provider:this.socialProvider}}),await k.ConnectionController.connectExternal({id:this.authConnector.id,type:this.authConnector.type,socialUri:t},this.authConnector.chain),this.socialProvider&&(R.M.setConnectedSocialProvider(this.socialProvider),S.X.sendEvent({type:"track",event:"SOCIAL_LOGIN_SUCCESS",properties:{provider:this.socialProvider}}))}}catch(e){this.error=!0,this.updateMessage(),this.socialProvider&&S.X.sendEvent({type:"track",event:"SOCIAL_LOGIN_ERROR",properties:{provider:this.socialProvider,message:b.j.parseError(e)}})}}else d.RouterController.goBack(),P.SnackController.showError("Untrusted Origin"),this.socialProvider&&S.X.sendEvent({type:"track",event:"SOCIAL_LOGIN_ERROR",properties:{provider:this.socialProvider,message:"Untrusted Origin"}})}},T.j.EmbeddedWalletAbortController.signal.addEventListener("abort",()=>{this.socialWindow&&(this.socialWindow.close(),x.AccountController.setSocialWindow(void 0,$.R.state.activeChain))}),this.unsubscribe.push(x.AccountController.subscribe(e=>{e.socialProvider&&(this.socialProvider=e.socialProvider),e.socialWindow&&(this.socialWindow=e.socialWindow)}),a.OptionsController.subscribeKey("remoteFeatures",e=>{this.remoteFeatures=e}),x.AccountController.subscribeKey("address",e=>{let t=this.remoteFeatures?.multiWallet;e&&e!==this.address&&(this.hasMultipleConnections&&t?(d.RouterController.replace("ProfileWallets"),P.SnackController.showSuccess("New Wallet Added")):(O.I.state.open||a.OptionsController.state.enableEmbedded)&&O.I.close())})),this.authConnector&&this.connectSocial()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),window.removeEventListener("message",this.handleSocialConnection,!1),this.socialWindow?.close(),x.AccountController.setSocialWindow(void 0,$.R.state.activeChain)}render(){return(0,i.dy)`
      <wui-flex
        data-error=${(0,n.o)(this.error)}
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","5","5"]}
        gap="6"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-logo logo=${(0,n.o)(this.socialProvider)}></wui-logo>
          ${this.error?null:this.loaderTemplate()}
          <wui-icon-box color="error" icon="close" size="sm"></wui-icon-box>
        </wui-flex>
        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="lg-medium" color="primary"
            >Log in with
            <span class="capitalize">${this.socialProvider??"Social"}</span></wui-text
          >
          <wui-text align="center" variant="lg-regular" color=${this.error?"error":"secondary"}
            >${this.message}</wui-text
          ></wui-flex
        >
      </wui-flex>
    `}loaderTemplate(){let e=E.ThemeController.state.themeVariables["--w3m-border-radius-master"],t=e?parseInt(e.replace("px",""),10):4;return(0,i.dy)`<wui-loading-thumbnail radius=${9*t}></wui-loading-thumbnail>`}connectSocial(){let e=setInterval(()=>{this.socialWindow?.closed&&(this.connecting||"ConnectingSocial"!==d.RouterController.state.view||(this.socialProvider&&S.X.sendEvent({type:"track",event:"SOCIAL_LOGIN_CANCELED",properties:{provider:this.socialProvider}}),d.RouterController.goBack()),clearInterval(e))},1e3);window.addEventListener("message",this.handleSocialConnection,!1)}updateMessage(){this.error?this.message="Something went wrong":this.connecting?this.message="Retrieving user data":this.message="Connect in the provider window"}};A.styles=I,L([(0,r.SB)()],A.prototype,"socialProvider",void 0),L([(0,r.SB)()],A.prototype,"socialWindow",void 0),L([(0,r.SB)()],A.prototype,"error",void 0),L([(0,r.SB)()],A.prototype,"connecting",void 0),L([(0,r.SB)()],A.prototype,"message",void 0),L([(0,r.SB)()],A.prototype,"remoteFeatures",void 0),A=L([(0,c.Mo)("w3m-connecting-social-view")],A),o(37826),o(85642),o(18370),o(91833);var _=(0,c.iv)`
  wui-shimmer {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-qr-code {
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  wui-logo {
    width: 80px;
    height: 80px;
    border-radius: ${({borderRadius:e})=>e["8"]};
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-icon-box {
    position: absolute;
    right: calc(${({spacing:e})=>e["1"]} * -1);
    bottom: calc(${({spacing:e})=>e["1"]} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition:
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity, transform;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`,F=function(e,t,o,i){var r,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,i);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(s=(n<3?r(s):n>3?r(t,o,s):r(t,o))||s);return n>3&&s&&Object.defineProperty(t,o,s),s};let B=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.timeout=void 0,this.socialProvider=x.AccountController.state.socialProvider,this.uri=x.AccountController.state.farcasterUrl,this.ready=!1,this.loading=!1,this.remoteFeatures=a.OptionsController.state.remoteFeatures,this.authConnector=l.ConnectorController.getAuthConnector(),this.forceUpdate=()=>{this.requestUpdate()},this.unsubscribe.push(x.AccountController.subscribeKey("farcasterUrl",e=>{e&&(this.uri=e,this.connectFarcaster())}),x.AccountController.subscribeKey("socialProvider",e=>{e&&(this.socialProvider=e)}),a.OptionsController.subscribeKey("remoteFeatures",e=>{this.remoteFeatures=e})),window.addEventListener("resize",this.forceUpdate)}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.timeout),window.removeEventListener("resize",this.forceUpdate)}render(){return this.onRenderProxy(),(0,i.dy)`${this.platformTemplate()}`}platformTemplate(){return b.j.isMobile()?(0,i.dy)`${this.mobileTemplate()}`:(0,i.dy)`${this.desktopTemplate()}`}desktopTemplate(){return this.loading?(0,i.dy)`${this.loadingTemplate()}`:(0,i.dy)`${this.qrTemplate()}`}qrTemplate(){return(0,i.dy)` <wui-flex
      flexDirection="column"
      alignItems="center"
      .padding=${["0","5","5","5"]}
      gap="5"
    >
      <wui-shimmer width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>

      <wui-text variant="lg-medium" color="primary"> Scan this QR Code with your phone </wui-text>
      ${this.copyTemplate()}
    </wui-flex>`}loadingTemplate(){return(0,i.dy)`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["5","5","5","5"]}
        gap="5"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-logo logo="farcaster"></wui-logo>
          ${this.loaderTemplate()}
          <wui-icon-box color="error" icon="close" size="sm"></wui-icon-box>
        </wui-flex>
        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="md-medium" color="primary">
            Loading user data
          </wui-text>
          <wui-text align="center" variant="sm-regular" color="secondary">
            Please wait a moment while we load your data.
          </wui-text>
        </wui-flex>
      </wui-flex>
    `}mobileTemplate(){return(0,i.dy)` <wui-flex
      flexDirection="column"
      alignItems="center"
      .padding=${["10","5","5","5"]}
      gap="5"
    >
      <wui-flex justifyContent="center" alignItems="center">
        <wui-logo logo="farcaster"></wui-logo>
        ${this.loaderTemplate()}
        <wui-icon-box
          color="error"
          icon="close"
          size="sm"
        ></wui-icon-box>
      </wui-flex>
      <wui-flex flexDirection="column" alignItems="center" gap="2">
        <wui-text align="center" variant="md-medium" color="primary"
          >Continue in Farcaster</span></wui-text
        >
        <wui-text align="center" variant="sm-regular" color="secondary"
          >Accept connection request in the app</wui-text
        ></wui-flex
      >
      ${this.mobileLinkTemplate()}
    </wui-flex>`}loaderTemplate(){let e=E.ThemeController.state.themeVariables["--w3m-border-radius-master"],t=e?parseInt(e.replace("px",""),10):4;return(0,i.dy)`<wui-loading-thumbnail radius=${9*t}></wui-loading-thumbnail>`}async connectFarcaster(){if(this.authConnector)try{await this.authConnector?.provider.connectFarcaster(),this.socialProvider&&(R.M.setConnectedSocialProvider(this.socialProvider),S.X.sendEvent({type:"track",event:"SOCIAL_LOGIN_REQUEST_USER_DATA",properties:{provider:this.socialProvider}})),this.loading=!0;let e=k.ConnectionController.getConnections(this.authConnector.chain).length>0;await k.ConnectionController.connectExternal(this.authConnector,this.authConnector.chain);let t=this.remoteFeatures?.multiWallet;this.socialProvider&&S.X.sendEvent({type:"track",event:"SOCIAL_LOGIN_SUCCESS",properties:{provider:this.socialProvider}}),this.loading=!1,e&&t?(d.RouterController.replace("ProfileWallets"),P.SnackController.showSuccess("New Wallet Added")):O.I.close()}catch(e){this.socialProvider&&S.X.sendEvent({type:"track",event:"SOCIAL_LOGIN_ERROR",properties:{provider:this.socialProvider,message:b.j.parseError(e)}}),d.RouterController.goBack(),P.SnackController.showError(e)}}mobileLinkTemplate(){return(0,i.dy)`<wui-button
      size="md"
      ?loading=${this.loading}
      ?disabled=${!this.uri||this.loading}
      @click=${()=>{this.uri&&b.j.openHref(this.uri,"_blank")}}
    >
      Open farcaster</wui-button
    >`}onRenderProxy(){!this.ready&&this.uri&&(this.timeout=setTimeout(()=>{this.ready=!0},200))}qrCodeTemplate(){if(!this.uri||!this.ready)return null;let e=this.getBoundingClientRect().width-40;return(0,i.dy)` <wui-qr-code
      size=${e}
      theme=${E.ThemeController.state.themeMode}
      uri=${this.uri}
      ?farcaster=${!0}
      data-testid="wui-qr-code"
      color=${(0,n.o)(E.ThemeController.state.themeVariables["--w3m-qr-color"])}
    ></wui-qr-code>`}copyTemplate(){let e=!this.uri||!this.ready;return(0,i.dy)`<wui-button
      .disabled=${e}
      @click=${this.onCopyUri}
      variant="neutral-secondary"
      size="sm"
      data-testid="copy-wc2-uri"
    >
      <wui-icon size="sm" color="default" slot="iconRight" name="copy"></wui-icon>
      Copy link
    </wui-button>`}onCopyUri(){try{this.uri&&(b.j.copyToClopboard(this.uri),P.SnackController.showSuccess("Link copied"))}catch{P.SnackController.showError("Failed to copy")}}};B.styles=_,F([(0,r.SB)()],B.prototype,"socialProvider",void 0),F([(0,r.SB)()],B.prototype,"uri",void 0),F([(0,r.SB)()],B.prototype,"ready",void 0),F([(0,r.SB)()],B.prototype,"loading",void 0),F([(0,r.SB)()],B.prototype,"remoteFeatures",void 0),B=F([(0,c.Mo)("w3m-connecting-farcaster-view")],B)},27912:function(e,t,o){var i=o(19064),r=o(59662),n=o(88686),s=o(77500),a=o(28740),c=o(35162),l=o(30183);o(21927),o(79556);var d=o(24134),u=o(25729),h=o(95636),p=(0,h.iv)`
  label {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    column-gap: ${({spacing:e})=>e[2]};
  }

  label > input[type='checkbox'] {
    height: 0;
    width: 0;
    opacity: 0;
    position: absolute;
  }

  label > span {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    border: 1px solid ${({colors:e})=>e.neutrals400};
    color: ${({colors:e})=>e.white};
    background-color: transparent;
    will-change: border-color, background-color;
  }

  label > span > wui-icon {
    opacity: 0;
    will-change: opacity;
  }

  label > input[type='checkbox']:checked + span > wui-icon {
    color: ${({colors:e})=>e.white};
  }

  label > input[type='checkbox']:not(:checked) > span > wui-icon {
    color: ${({colors:e})=>e.neutrals900};
  }

  label > input[type='checkbox']:checked + span > wui-icon {
    opacity: 1;
  }

  /* -- Sizes --------------------------------------------------- */
  label[data-size='lg'] > span {
    width: 24px;
    height: 24px;
    min-width: 24px;
    min-height: 24px;
    border-radius: ${({borderRadius:e})=>e[10]};
  }

  label[data-size='md'] > span {
    width: 20px;
    height: 20px;
    min-width: 20px;
    min-height: 20px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  label[data-size='sm'] > span {
    width: 16px;
    height: 16px;
    min-width: 16px;
    min-height: 16px;
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  /* -- Focus states --------------------------------------------------- */
  label > input[type='checkbox']:focus-visible + span,
  label > input[type='checkbox']:focus + span {
    border: 1px solid ${({tokens:e})=>e.core.borderAccentPrimary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  /* -- Checked states --------------------------------------------------- */
  label > input[type='checkbox']:checked + span {
    background-color: ${({tokens:e})=>e.core.iconAccentPrimary};
    border: 1px solid transparent;
  }

  /* -- Hover states --------------------------------------------------- */
  input[type='checkbox']:not(:checked):not(:disabled) + span:hover {
    border: 1px solid ${({colors:e})=>e.neutrals700};
    background-color: ${({colors:e})=>e.neutrals800};
    box-shadow: none;
  }

  input[type='checkbox']:checked:not(:disabled) + span:hover {
    border: 1px solid transparent;
    background-color: ${({colors:e})=>e.accent080};
    box-shadow: none;
  }

  /* -- Disabled state --------------------------------------------------- */
  label > input[type='checkbox']:checked:disabled + span {
    border: 1px solid transparent;
    opacity: 0.3;
  }

  label > input[type='checkbox']:not(:checked):disabled + span {
    border: 1px solid ${({colors:e})=>e.neutrals700};
  }

  label:has(input[type='checkbox']:disabled) {
    cursor: auto;
  }

  label > input[type='checkbox']:disabled + span {
    cursor: not-allowed;
  }
`,b=function(e,t,o,i){var r,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,i);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(s=(n<3?r(s):n>3?r(t,o,s):r(t,o))||s);return n>3&&s&&Object.defineProperty(t,o,s),s};let g={lg:"md",md:"sm",sm:"sm"},f=class extends i.oi{constructor(){super(...arguments),this.inputElementRef=(0,l.V)(),this.checked=void 0,this.disabled=!1,this.size="md"}render(){let e=g[this.size];return(0,i.dy)`
      <label data-size=${this.size}>
        <input
          ${(0,l.i)(this.inputElementRef)}
          ?checked=${(0,c.o)(this.checked)}
          ?disabled=${this.disabled}
          type="checkbox"
          @change=${this.dispatchChangeEvent}
        />
        <span>
          <wui-icon name="checkmarkBold" size=${e}></wui-icon>
        </span>
        <slot></slot>
      </label>
    `}dispatchChangeEvent(){this.dispatchEvent(new CustomEvent("checkboxChange",{detail:this.inputElementRef.value?.checked,bubbles:!0,composed:!0}))}};f.styles=[d.ET,p],b([(0,r.Cb)({type:Boolean})],f.prototype,"checked",void 0),b([(0,r.Cb)({type:Boolean})],f.prototype,"disabled",void 0),b([(0,r.Cb)()],f.prototype,"size",void 0),f=b([(0,u.M)("wui-checkbox")],f),o(68390);var w=(0,a.iv)`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  wui-checkbox {
    padding: ${({spacing:e})=>e["3"]};
  }
  a {
    text-decoration: none;
    color: ${({tokens:e})=>e.theme.textSecondary};
    font-weight: 500;
  }
`,m=function(e,t,o,i){var r,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,i);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(s=(n<3?r(s):n>3?r(t,o,s):r(t,o))||s);return n>3&&s&&Object.defineProperty(t,o,s),s};let y=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.checked=n.M.state.isLegalCheckboxChecked,this.unsubscribe.push(n.M.subscribeKey("isLegalCheckboxChecked",e=>{this.checked=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=s.OptionsController.state,o=s.OptionsController.state.features?.legalCheckbox;return(e||t)&&o?(0,i.dy)`
      <wui-checkbox
        ?checked=${this.checked}
        @checkboxChange=${this.onCheckboxChange.bind(this)}
        data-testid="wui-checkbox"
      >
        <wui-text color="secondary" variant="sm-regular" align="left">
          I agree to our ${this.termsTemplate()} ${this.andTemplate()} ${this.privacyTemplate()}
        </wui-text>
      </wui-checkbox>
    `:null}andTemplate(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=s.OptionsController.state;return e&&t?"and":""}termsTemplate(){let{termsConditionsUrl:e}=s.OptionsController.state;return e?(0,i.dy)`<a rel="noreferrer" target="_blank" href=${e}>terms of service</a>`:null}privacyTemplate(){let{privacyPolicyUrl:e}=s.OptionsController.state;return e?(0,i.dy)`<a rel="noreferrer" target="_blank" href=${e}>privacy policy</a>`:null}onCheckboxChange(){n.M.setIsLegalCheckboxChecked(!this.checked)}};y.styles=[w],m([(0,r.SB)()],y.prototype,"checked",void 0),m([(0,a.Mo)("w3m-legal-checkbox")],y)},85642:function(e,t,o){o(21927)},75022:function(e,t,o){var i=o(19064),r=o(59662),n=o(35162);o(79556);var s=o(24134),a=o(25729);o(51880);var c=o(95636),l=(0,c.iv)`
  :host {
    width: 100%;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({spacing:e})=>e[3]};
    width: 100%;
    background-color: transparent;
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-text {
    text-transform: capitalize;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`,d=function(e,t,o,i){var r,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,i);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(s=(n<3?r(s):n>3?r(t,o,s):r(t,o))||s);return n>3&&s&&Object.defineProperty(t,o,s),s};let u=class extends i.oi{constructor(){super(...arguments),this.logo="google",this.name="Continue with google",this.disabled=!1}render(){return(0,i.dy)`
      <button ?disabled=${this.disabled} tabindex=${(0,n.o)(this.tabIdx)}>
        <wui-flex gap="2" alignItems="center">
          <wui-image ?boxed=${!0} logo=${this.logo}></wui-image>
          <wui-text variant="lg-regular" color="primary">${this.name}</wui-text>
        </wui-flex>
        <wui-icon name="chevronRight" size="lg" color="default"></wui-icon>
      </button>
    `}};u.styles=[s.ET,s.ZM,l],d([(0,r.Cb)()],u.prototype,"logo",void 0),d([(0,r.Cb)()],u.prototype,"name",void 0),d([(0,r.Cb)()],u.prototype,"tabIdx",void 0),d([(0,r.Cb)({type:Boolean})],u.prototype,"disabled",void 0),d([(0,a.M)("wui-list-social")],u)},7013:function(e,t,o){var i=o(19064),r=o(59662),n=o(24134),s=o(25729),a=o(95636),c=(0,a.iv)`
  :host {
    display: block;
    width: 100px;
    height: 100px;
  }

  svg {
    width: 100px;
    height: 100px;
  }

  rect {
    fill: none;
    stroke: ${e=>e.colors.accent100};
    stroke-width: 3px;
    stroke-linecap: round;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: 0px;
    }
  }
`,l=function(e,t,o,i){var r,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,i);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(s=(n<3?r(s):n>3?r(t,o,s):r(t,o))||s);return n>3&&s&&Object.defineProperty(t,o,s),s};let d=class extends i.oi{constructor(){super(...arguments),this.radius=36}render(){return this.svgLoaderTemplate()}svgLoaderTemplate(){let e=this.radius>50?50:this.radius,t=36-e;return(0,i.dy)`
      <svg viewBox="0 0 110 110" width="110" height="110">
        <rect
          x="2"
          y="2"
          width="106"
          height="106"
          rx=${e}
          stroke-dasharray="${116+t} ${245+t}"
          stroke-dashoffset=${360+1.75*t}
        />
      </svg>
    `}};d.styles=[n.ET,c],l([(0,r.Cb)({type:Number})],d.prototype,"radius",void 0),l([(0,s.M)("wui-loading-thumbnail")],d)},91833:function(e,t,o){o(22584)},22584:function(e,t,o){var i=o(19064),r=o(59662),n=o(25729),s=o(95636),a=(0,s.iv)`
  :host {
    display: block;
    background: linear-gradient(
      90deg,
      ${({tokens:e})=>e.theme.foregroundSecondary} 0%,
      ${({tokens:e})=>e.theme.foregroundTertiary} 50%,
      ${({tokens:e})=>e.theme.foregroundSecondary} 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1s ease-in-out infinite;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  :host([data-rounded='true']) {
    border-radius: ${({borderRadius:e})=>e[16]};
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`,c=function(e,t,o,i){var r,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,i);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(s=(n<3?r(s):n>3?r(t,o,s):r(t,o))||s);return n>3&&s&&Object.defineProperty(t,o,s),s};let l=class extends i.oi{constructor(){super(...arguments),this.width="",this.height="",this.variant="default",this.rounded=!1}render(){return this.style.cssText=`
      width: ${this.width};
      height: ${this.height};
    `,this.dataset.rounded=this.rounded?"true":"false",(0,i.dy)`<slot></slot>`}};l.styles=[a],c([(0,r.Cb)()],l.prototype,"width",void 0),c([(0,r.Cb)()],l.prototype,"height",void 0),c([(0,r.Cb)()],l.prototype,"variant",void 0),c([(0,r.Cb)({type:Boolean})],l.prototype,"rounded",void 0),c([(0,n.M)("wui-shimmer")],l)},51880:function(e,t,o){var i=o(19064),r=o(59662);o(21927);var n=o(24134),s=o(25729),a=o(95636),c=(0,a.iv)`
  :host {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: ${({borderRadius:e})=>e["20"]};
    overflow: hidden;
  }

  wui-icon {
    width: 100%;
    height: 100%;
  }
`,l=function(e,t,o,i){var r,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,o,i);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(s=(n<3?r(s):n>3?r(t,o,s):r(t,o))||s);return n>3&&s&&Object.defineProperty(t,o,s),s};let d=class extends i.oi{constructor(){super(...arguments),this.logo="google"}render(){return(0,i.dy)`<wui-icon color="inherit" size="inherit" name=${this.logo}></wui-icon> `}};d.styles=[n.ET,c],l([(0,r.Cb)()],d.prototype,"logo",void 0),l([(0,s.M)("wui-logo")],d)}}]);