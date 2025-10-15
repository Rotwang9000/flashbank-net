"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9664],{63735:function(e,t,o){o.d(t,{U:function(){return i}});let i={URLS:{FAQ:"https://walletconnect.com/faq"}}},1181:function(e,t,o){o.d(t,{y0:function(){return w}});var i=o(68314),n=o(83966),r=o(59757),a=o(9793),s=o(51440),l=o(4511),c=o(82879),d=o(83241),u=o(64125);async function h(){l.RouterController.push("ConnectingFarcaster");let e=a.ConnectorController.getAuthConnector();if(e&&!n.AccountController.state.farcasterUrl)try{let{url:t}=await e.provider.getFarcasterUri();n.AccountController.setFarcasterUrl(t,r.R.state.activeChain)}catch(e){l.RouterController.goBack(),c.SnackController.showError(e)}}async function p(e){l.RouterController.push("ConnectingSocial");let t=a.ConnectorController.getAuthConnector(),o=null;try{let a=setTimeout(()=>{throw Error("Social login timed out. Please try again.")},45e3);if(t&&e){if(d.j.isTelegram()||(o=function(){try{return d.j.returnOpenHref(`${i.b.SECURE_SITE_SDK_ORIGIN}/loading`,"popupWindow","width=600,height=800,scrollbars=yes")}catch(e){throw Error("Could not open social popup")}}()),o)n.AccountController.setSocialWindow(o,r.R.state.activeChain);else if(!d.j.isTelegram())throw Error("Could not create social popup");let{uri:s}=await t.provider.getSocialRedirectUri({provider:e});if(!s)throw o?.close(),Error("Could not fetch the social redirect uri");if(o&&(o.location.href=s),d.j.isTelegram()){u.M.setTelegramSocialProvider(e);let t=d.j.formatTelegramSocialLoginUrl(s);d.j.openHref(t,"_top")}clearTimeout(a)}}catch(e){o?.close(),c.SnackController.showError(e?.message)}}async function w(e){n.AccountController.setSocialProvider(e,r.R.state.activeChain),s.X.sendEvent({type:"track",event:"SOCIAL_LOGIN_STARTED",properties:{provider:e}}),"farcaster"===e?await h():await p(e)}},29664:function(e,t,o){o.r(t),o.d(t,{AppKitAccountButton:function(){return k},AppKitButton:function(){return I},AppKitConnectButton:function(){return D},AppKitNetworkButton:function(){return H},W3mAccountButton:function(){return $},W3mAccountSettingsView:function(){return ed},W3mAccountView:function(){return eK},W3mAllWalletsView:function(){return tO},W3mButton:function(){return A},W3mChooseAccountNameView:function(){return o1},W3mConnectButton:function(){return B},W3mConnectView:function(){return oy},W3mConnectWalletsView:function(){return it},W3mConnectingExternalView:function(){return oN},W3mConnectingMultiChainView:function(){return oB},W3mConnectingWcBasicView:function(){return oJ},W3mConnectingWcView:function(){return oY},W3mDownloadsView:function(){return o2},W3mFooter:function(){return q.M},W3mGetWalletView:function(){return o5},W3mNetworkButton:function(){return V},W3mNetworkSwitchView:function(){return is},W3mNetworksView:function(){return iw},W3mProfileWalletsView:function(){return te},W3mRouter:function(){return K.A},W3mSIWXSignMessageView:function(){return iW},W3mSwitchActiveChainView:function(){return iy},W3mUnsupportedChainView:function(){return ik},W3mWalletCompatibleNetworksView:function(){return iI},W3mWhatIsANetworkView:function(){return iv},W3mWhatIsAWalletView:function(){return o7}});var i=o(19064),n=o(59662),r=o(35162),a=o(77500),s=o(59757),l=o(87374),c=o(44639),d=o(83966),u=o(83241),h=o(83662),p=o(28740);o(21927),o(31059),o(51243),o(79556),o(76630);var w=o(24134),b=o(1512),m=o(25729);o(98576);var g=o(95636),f=(0,g.iv)`
  :host {
    display: block;
  }

  button {
    border-radius: ${({borderRadius:e})=>e["20"]};
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    display: flex;
    gap: ${({spacing:e})=>e[1]};
    padding: ${({spacing:e})=>e[1]};
    color: ${({tokens:e})=>e.theme.textSecondary};
    border-radius: ${({borderRadius:e})=>e[16]};
    height: 32px;
    transition: box-shadow ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: box-shadow;
  }

  button wui-flex.avatar-container {
    width: 28px;
    height: 24px;
    position: relative;

    wui-flex.network-image-container {
      position: absolute;
      bottom: 0px;
      right: 0px;
      width: 12px;
      height: 12px;
    }

    wui-avatar {
      width: 24px;
      min-width: 24px;
      height: 24px;
    }

    wui-icon {
      width: 12px;
      height: 12px;
    }
  }

  wui-image,
  wui-icon {
    border-radius: ${({borderRadius:e})=>e[16]};
  }

  wui-text {
    white-space: nowrap;
  }

  button wui-flex.balance-container {
    height: 100%;
    border-radius: ${({borderRadius:e})=>e[16]};
    padding-left: ${({spacing:e})=>e[1]};
    padding-right: ${({spacing:e})=>e[1]};
    background: ${({tokens:e})=>e.theme.foregroundSecondary};
    color: ${({tokens:e})=>e.theme.textPrimary};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button:hover:enabled,
  button:focus-visible:enabled,
  button:active:enabled {
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.2);

    wui-flex.balance-container {
      background: ${({tokens:e})=>e.theme.foregroundTertiary};
    }
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled wui-text,
  button:disabled wui-flex.avatar-container {
    opacity: 0.3;
  }
`,y=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let C=class extends i.oi{constructor(){super(...arguments),this.networkSrc=void 0,this.avatarSrc=void 0,this.balance=void 0,this.isUnsupportedChain=void 0,this.disabled=!1,this.loading=!1,this.address="",this.profileName="",this.charsStart=4,this.charsEnd=6}render(){return(0,i.dy)`
      <button
        ?disabled=${this.disabled}
        class=${(0,r.o)(this.balance?void 0:"local-no-balance")}
        data-error=${(0,r.o)(this.isUnsupportedChain)}
      >
        ${this.imageTemplate()} ${this.addressTemplate()} ${this.balanceTemplate()}
      </button>
    `}imageTemplate(){let e=this.networkSrc?(0,i.dy)`<wui-image src=${this.networkSrc}></wui-image>`:(0,i.dy)` <wui-icon size="inherit" color="inherit" icon="networkPlaceholder"></wui-icon> `;return(0,i.dy)`<wui-flex class="avatar-container">
      <wui-avatar
        .imageSrc=${this.avatarSrc}
        alt=${this.address}
        address=${this.address}
      ></wui-avatar>

      <wui-flex class="network-image-container">${e}</wui-flex>
    </wui-flex>`}addressTemplate(){return(0,i.dy)`<wui-text variant="md-regular" color="inherit">
      ${this.address?b.H.getTruncateString({string:this.profileName||this.address,charsStart:this.profileName?18:this.charsStart,charsEnd:this.profileName?0:this.charsEnd,truncate:this.profileName?"end":"middle"}):null}
    </wui-text>`}balanceTemplate(){if(this.balance){let e=this.loading?(0,i.dy)`<wui-loading-spinner size="md" color="inherit"></wui-loading-spinner>`:(0,i.dy)`<wui-text variant="md-regular" color="inherit"> ${this.balance}</wui-text>`;return(0,i.dy)`<wui-flex alignItems="center" justifyContent="center" class="balance-container"
        >${e}</wui-flex
      >`}return null}};C.styles=[w.ET,w.ZM,f],y([(0,n.Cb)()],C.prototype,"networkSrc",void 0),y([(0,n.Cb)()],C.prototype,"avatarSrc",void 0),y([(0,n.Cb)()],C.prototype,"balance",void 0),y([(0,n.Cb)({type:Boolean})],C.prototype,"isUnsupportedChain",void 0),y([(0,n.Cb)({type:Boolean})],C.prototype,"disabled",void 0),y([(0,n.Cb)({type:Boolean})],C.prototype,"loading",void 0),y([(0,n.Cb)()],C.prototype,"address",void 0),y([(0,n.Cb)()],C.prototype,"profileName",void 0),y([(0,n.Cb)()],C.prototype,"charsStart",void 0),y([(0,n.Cb)()],C.prototype,"charsEnd",void 0),C=y([(0,m.M)("wui-account-button")],C);var v=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};class x extends i.oi{constructor(){super(...arguments),this.unsubscribe=[],this.disabled=!1,this.balance="show",this.charsStart=4,this.charsEnd=6,this.namespace=void 0,this.isSupported=!!a.OptionsController.state.allowUnsupportedChain||!s.R.state.activeChain||s.R.checkIfSupportedNetwork(s.R.state.activeChain)}connectedCallback(){super.connectedCallback(),this.setAccountData(s.R.getAccountData(this.namespace)),this.setNetworkData(s.R.getNetworkData(this.namespace))}firstUpdated(){let e=this.namespace;e?this.unsubscribe.push(s.R.subscribeChainProp("accountState",e=>{this.setAccountData(e)},e),s.R.subscribeChainProp("networkState",t=>{this.setNetworkData(t),this.isSupported=s.R.checkIfSupportedNetwork(e,t?.caipNetwork?.caipNetworkId)},e)):this.unsubscribe.push(l.W.subscribeNetworkImages(()=>{this.networkImage=c.f.getNetworkImage(this.network)}),s.R.subscribeKey("activeCaipAddress",e=>{this.caipAddress=e}),d.AccountController.subscribeKey("balance",e=>this.balanceVal=e),d.AccountController.subscribeKey("balanceSymbol",e=>this.balanceSymbol=e),d.AccountController.subscribeKey("profileName",e=>this.profileName=e),d.AccountController.subscribeKey("profileImage",e=>this.profileImage=e),s.R.subscribeKey("activeCaipNetwork",e=>{this.network=e,this.networkImage=c.f.getNetworkImage(e),this.isSupported=!e?.chainNamespace||s.R.checkIfSupportedNetwork(e?.chainNamespace),this.fetchNetworkImage(e)}))}updated(){this.fetchNetworkImage(this.network)}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(!s.R.state.activeChain)return null;let e="show"===this.balance,t="string"!=typeof this.balanceVal,{formattedText:o}=u.j.parseBalance(this.balanceVal,this.balanceSymbol);return(0,i.dy)`
      <wui-account-button
        .disabled=${!!this.disabled}
        .isUnsupportedChain=${!a.OptionsController.state.allowUnsupportedChain&&!this.isSupported}
        address=${(0,r.o)(u.j.getPlainAddress(this.caipAddress))}
        profileName=${(0,r.o)(this.profileName)}
        networkSrc=${(0,r.o)(this.networkImage)}
        avatarSrc=${(0,r.o)(this.profileImage)}
        balance=${e?o:""}
        @click=${this.onClick.bind(this)}
        data-testid=${`account-button${this.namespace?`-${this.namespace}`:""}`}
        .charsStart=${this.charsStart}
        .charsEnd=${this.charsEnd}
        ?loading=${t}
      >
      </wui-account-button>
    `}onClick(){this.isSupported||a.OptionsController.state.allowUnsupportedChain?h.I.open({namespace:this.namespace}):h.I.open({view:"UnsupportedChain"})}async fetchNetworkImage(e){e?.assets?.imageId&&(this.networkImage=await c.f.fetchNetworkImage(e?.assets?.imageId))}setAccountData(e){e&&(this.caipAddress=e.caipAddress,this.balanceVal=e.balance,this.balanceSymbol=e.balanceSymbol,this.profileName=e.profileName,this.profileImage=e.profileImage)}setNetworkData(e){e&&(this.network=e.caipNetwork,this.networkImage=c.f.getNetworkImage(e.caipNetwork))}}v([(0,n.Cb)({type:Boolean})],x.prototype,"disabled",void 0),v([(0,n.Cb)()],x.prototype,"balance",void 0),v([(0,n.Cb)()],x.prototype,"charsStart",void 0),v([(0,n.Cb)()],x.prototype,"charsEnd",void 0),v([(0,n.Cb)()],x.prototype,"namespace",void 0),v([(0,n.SB)()],x.prototype,"caipAddress",void 0),v([(0,n.SB)()],x.prototype,"balanceVal",void 0),v([(0,n.SB)()],x.prototype,"balanceSymbol",void 0),v([(0,n.SB)()],x.prototype,"profileName",void 0),v([(0,n.SB)()],x.prototype,"profileImage",void 0),v([(0,n.SB)()],x.prototype,"network",void 0),v([(0,n.SB)()],x.prototype,"networkImage",void 0),v([(0,n.SB)()],x.prototype,"isSupported",void 0);let $=class extends x{};$=v([(0,p.Mo)("w3m-account-button")],$);let k=class extends x{};k=v([(0,p.Mo)("appkit-account-button")],k);var S=(0,i.iv)`
  :host {
    display: block;
    width: max-content;
  }
`,R=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};class E extends i.oi{constructor(){super(...arguments),this.unsubscribe=[],this.disabled=!1,this.balance=void 0,this.size=void 0,this.label=void 0,this.loadingLabel=void 0,this.charsStart=4,this.charsEnd=6,this.namespace=void 0}firstUpdated(){this.caipAddress=this.namespace?s.R.state.chains.get(this.namespace)?.accountState?.caipAddress:s.R.state.activeCaipAddress,this.namespace?this.unsubscribe.push(s.R.subscribeChainProp("accountState",e=>{this.caipAddress=e?.caipAddress},this.namespace)):this.unsubscribe.push(s.R.subscribeKey("activeCaipAddress",e=>this.caipAddress=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return this.caipAddress?(0,i.dy)`
          <appkit-account-button
            .disabled=${!!this.disabled}
            balance=${(0,r.o)(this.balance)}
            .charsStart=${(0,r.o)(this.charsStart)}
            .charsEnd=${(0,r.o)(this.charsEnd)}
            namespace=${(0,r.o)(this.namespace)}
          >
          </appkit-account-button>
        `:(0,i.dy)`
          <appkit-connect-button
            size=${(0,r.o)(this.size)}
            label=${(0,r.o)(this.label)}
            loadingLabel=${(0,r.o)(this.loadingLabel)}
            namespace=${(0,r.o)(this.namespace)}
          ></appkit-connect-button>
        `}}E.styles=S,R([(0,n.Cb)({type:Boolean})],E.prototype,"disabled",void 0),R([(0,n.Cb)()],E.prototype,"balance",void 0),R([(0,n.Cb)()],E.prototype,"size",void 0),R([(0,n.Cb)()],E.prototype,"label",void 0),R([(0,n.Cb)()],E.prototype,"loadingLabel",void 0),R([(0,n.Cb)()],E.prototype,"charsStart",void 0),R([(0,n.Cb)()],E.prototype,"charsEnd",void 0),R([(0,n.Cb)()],E.prototype,"namespace",void 0),R([(0,n.SB)()],E.prototype,"caipAddress",void 0);let A=class extends E{};A=R([(0,p.Mo)("w3m-button")],A);let I=class extends E{};I=R([(0,p.Mo)("appkit-button")],I);var T=(0,g.iv)`
  :host {
    position: relative;
    display: block;
  }

  button {
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='sm'] {
    padding: ${({spacing:e})=>e[2]};
  }

  button[data-size='md'] {
    padding: ${({spacing:e})=>e[3]};
  }

  button[data-size='lg'] {
    padding: ${({spacing:e})=>e[4]};
  }

  button[data-variant='primary'] {
    background: ${({tokens:e})=>e.core.backgroundAccentPrimary};
  }

  button[data-variant='secondary'] {
    background: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  button:hover:enabled {
    border-radius: ${({borderRadius:e})=>e[3]};
  }

  button:disabled {
    cursor: not-allowed;
  }

  button[data-loading='true'] {
    cursor: not-allowed;
  }

  button[data-loading='true'][data-size='sm'] {
    border-radius: ${({borderRadius:e})=>e[32]};
    padding: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]};
  }

  button[data-loading='true'][data-size='md'] {
    border-radius: ${({borderRadius:e})=>e[20]};
    padding: ${({spacing:e})=>e[3]} ${({spacing:e})=>e[4]};
  }

  button[data-loading='true'][data-size='lg'] {
    border-radius: ${({borderRadius:e})=>e[16]};
    padding: ${({spacing:e})=>e[4]} ${({spacing:e})=>e[5]};
  }
`,O=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let N=class extends i.oi{constructor(){super(...arguments),this.size="md",this.variant="primary",this.loading=!1,this.text="Connect Wallet"}render(){return(0,i.dy)`
      <button
        data-loading=${this.loading}
        data-variant=${this.variant}
        data-size=${this.size}
        ?disabled=${this.loading}
      >
        ${this.contentTemplate()}
      </button>
    `}contentTemplate(){let e={primary:"invert",secondary:"accent-primary"};return this.loading?(0,i.dy)`<wui-loading-spinner
      color=${e[this.variant]}
      size=${this.size}
    ></wui-loading-spinner>`:(0,i.dy)` <wui-text variant=${({lg:"lg-regular",md:"md-regular",sm:"sm-regular"})[this.size]} color=${e[this.variant]}>
        ${this.text}
      </wui-text>`}};N.styles=[w.ET,w.ZM,T],O([(0,n.Cb)()],N.prototype,"size",void 0),O([(0,n.Cb)()],N.prototype,"variant",void 0),O([(0,n.Cb)({type:Boolean})],N.prototype,"loading",void 0),O([(0,n.Cb)()],N.prototype,"text",void 0),N=O([(0,m.M)("wui-connect-button")],N);var j=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};class P extends i.oi{constructor(){super(),this.unsubscribe=[],this.size="md",this.label="Connect Wallet",this.loadingLabel="Connecting...",this.open=h.I.state.open,this.loading=this.namespace?h.I.state.loadingNamespaceMap.get(this.namespace):h.I.state.loading,this.unsubscribe.push(h.I.subscribe(e=>{this.open=e.open,this.loading=this.namespace?e.loadingNamespaceMap.get(this.namespace):e.loading}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return(0,i.dy)`
      <wui-connect-button
        size=${(0,r.o)(this.size)}
        .loading=${this.loading}
        @click=${this.onClick.bind(this)}
        data-testid=${`connect-button${this.namespace?`-${this.namespace}`:""}`}
      >
        ${this.loading?this.loadingLabel:this.label}
      </wui-connect-button>
    `}onClick(){this.open?h.I.close():this.loading||h.I.open({view:"Connect",namespace:this.namespace})}}j([(0,n.Cb)()],P.prototype,"size",void 0),j([(0,n.Cb)()],P.prototype,"label",void 0),j([(0,n.Cb)()],P.prototype,"loadingLabel",void 0),j([(0,n.Cb)()],P.prototype,"namespace",void 0),j([(0,n.SB)()],P.prototype,"open",void 0),j([(0,n.SB)()],P.prototype,"loading",void 0);let B=class extends P{};B=j([(0,p.Mo)("w3m-connect-button")],B);let D=class extends P{};D=j([(0,p.Mo)("appkit-connect-button")],D);var W=o(51440);o(25004);var L=(0,g.iv)`
  :host {
    display: block;
  }

  button {
    border-radius: ${({borderRadius:e})=>e[32]};
    display: flex;
    gap: ${({spacing:e})=>e[1]};
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]}
      ${({spacing:e})=>e[1]} ${({spacing:e})=>e[1]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  button[data-size='sm'] > wui-icon-box,
  button[data-size='sm'] > wui-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='md'] > wui-icon-box,
  button[data-size='md'] > wui-image {
    width: 20px;
    height: 20px;
  }

  button[data-size='lg'] > wui-icon-box,
  button[data-size='lg'] > wui-image {
    width: 24px;
    height: 24px;
  }

  wui-image,
  wui-icon-box {
    border-radius: ${({borderRadius:e})=>e[32]};
  }
`,M=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let _=class extends i.oi{constructor(){super(...arguments),this.imageSrc=void 0,this.isUnsupportedChain=void 0,this.disabled=!1,this.size="lg"}render(){return(0,i.dy)`
      <button data-size=${this.size} data-testid="wui-network-button" ?disabled=${this.disabled}>
        ${this.visualTemplate()}
        <wui-text variant=${({sm:"sm-regular",md:"md-regular",lg:"lg-regular"})[this.size]} color="primary">
          <slot></slot>
        </wui-text>
      </button>
    `}visualTemplate(){return this.isUnsupportedChain?(0,i.dy)` <wui-icon-box color="error" icon="warningCircle"></wui-icon-box> `:this.imageSrc?(0,i.dy)`<wui-image src=${this.imageSrc}></wui-image>`:(0,i.dy)` <wui-icon-box color="default" icon="networkPlaceholder"></wui-icon-box> `}};_.styles=[w.ET,w.ZM,L],M([(0,n.Cb)()],_.prototype,"imageSrc",void 0),M([(0,n.Cb)({type:Boolean})],_.prototype,"isUnsupportedChain",void 0),M([(0,n.Cb)({type:Boolean})],_.prototype,"disabled",void 0),M([(0,n.Cb)()],_.prototype,"size",void 0),_=M([(0,m.M)("wui-network-button")],_);var z=(0,i.iv)`
  :host {
    display: block;
    width: max-content;
  }
`,U=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};class F extends i.oi{constructor(){super(),this.unsubscribe=[],this.disabled=!1,this.network=s.R.state.activeCaipNetwork,this.networkImage=c.f.getNetworkImage(this.network),this.caipAddress=s.R.state.activeCaipAddress,this.loading=h.I.state.loading,this.isSupported=!!a.OptionsController.state.allowUnsupportedChain||!s.R.state.activeChain||s.R.checkIfSupportedNetwork(s.R.state.activeChain),this.unsubscribe.push(l.W.subscribeNetworkImages(()=>{this.networkImage=c.f.getNetworkImage(this.network)}),s.R.subscribeKey("activeCaipAddress",e=>{this.caipAddress=e}),s.R.subscribeKey("activeCaipNetwork",e=>{this.network=e,this.networkImage=c.f.getNetworkImage(e),this.isSupported=!e?.chainNamespace||s.R.checkIfSupportedNetwork(e.chainNamespace),c.f.fetchNetworkImage(e?.assets?.imageId)}),h.I.subscribeKey("loading",e=>this.loading=e))}firstUpdated(){c.f.fetchNetworkImage(this.network?.assets?.imageId)}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=!this.network||s.R.checkIfSupportedNetwork(this.network.chainNamespace);return(0,i.dy)`
      <wui-network-button
        .disabled=${!!(this.disabled||this.loading)}
        .isUnsupportedChain=${!a.OptionsController.state.allowUnsupportedChain&&!e}
        imageSrc=${(0,r.o)(this.networkImage)}
        @click=${this.onClick.bind(this)}
        data-testid="w3m-network-button"
      >
        ${this.getLabel()}
        <slot></slot>
      </wui-network-button>
    `}getLabel(){return this.network?this.isSupported||a.OptionsController.state.allowUnsupportedChain?this.network.name:"Switch Network":this.label?this.label:this.caipAddress?"Unknown Network":"Select Network"}onClick(){this.loading||(W.X.sendEvent({type:"track",event:"CLICK_NETWORKS"}),h.I.open({view:"Networks"}))}}F.styles=z,U([(0,n.Cb)({type:Boolean})],F.prototype,"disabled",void 0),U([(0,n.Cb)({type:String})],F.prototype,"label",void 0),U([(0,n.SB)()],F.prototype,"network",void 0),U([(0,n.SB)()],F.prototype,"networkImage",void 0),U([(0,n.SB)()],F.prototype,"caipAddress",void 0),U([(0,n.SB)()],F.prototype,"loading",void 0),U([(0,n.SB)()],F.prototype,"isSupported",void 0);let V=class extends F{};V=U([(0,p.Mo)("w3m-network-button")],V);let H=class extends F{};H=U([(0,p.Mo)("appkit-network-button")],H);var K=o(86613),q=o(32199),G=o(68314),X=o(9793),Y=o(47205),Z=o(82879),J=o(18462),Q=o(4511),ee=o(29460),et=o(21522);o(82100),o(8035),o(84350),o(14768);var eo=(0,g.iv)`
  :host {
    display: block;
  }

  button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({spacing:e})=>e[4]};
    padding: ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[4]};
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  wui-flex > wui-icon {
    padding: ${({spacing:e})=>e[2]};
    color: ${({tokens:e})=>e.theme.textInvert};
    background-color: ${({tokens:e})=>e.core.backgroundAccentPrimary};
    border-radius: ${({borderRadius:e})=>e[2]};
    align-items: normal;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.core.foregroundAccent020};
    }
  }
`,ei=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let en=class extends i.oi{constructor(){super(...arguments),this.label="",this.description="",this.icon="wallet"}render(){return(0,i.dy)`
      <button>
        <wui-flex gap="2" alignItems="center">
          <wui-icon weight="fill" size="md" name=${this.icon} color="inherit"></wui-icon>
          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="md-medium" color="primary">${this.label}</wui-text>
            <wui-text variant="md-regular" color="tertiary">${this.description}</wui-text>
          </wui-flex>
        </wui-flex>
        <wui-icon size="lg" color="accent-primary" name="chevronRight"></wui-icon>
      </button>
    `}};en.styles=[w.ET,w.ZM,eo],ei([(0,n.Cb)()],en.prototype,"label",void 0),ei([(0,n.Cb)()],en.prototype,"description",void 0),ei([(0,n.Cb)()],en.prototype,"icon",void 0),en=ei([(0,m.M)("wui-notice-card")],en),o(68390);var er=o(22192),ea=o(64125),es=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let el=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.socialProvider=ea.M.getConnectedSocialProvider(),this.socialUsername=ea.M.getConnectedSocialUsername(),this.namespace=s.R.state.activeChain,this.unsubscribe.push(s.R.subscribeKey("activeChain",e=>{this.namespace=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=X.ConnectorController.getConnectorId(this.namespace),t=X.ConnectorController.getAuthConnector();if(!t||e!==G.b.CONNECTOR_ID.AUTH)return this.style.cssText="display: none",null;let o=t.provider.getEmail()??"";return o||this.socialUsername?(0,i.dy)`
      <wui-list-item
        ?rounded=${!0}
        icon=${this.socialProvider??"mail"}
        data-testid="w3m-account-email-update"
        ?chevron=${!this.socialProvider}
        @click=${()=>{this.onGoToUpdateEmail(o,this.socialProvider)}}
      >
        <wui-text variant="lg-regular" color="primary">${this.getAuthName(o)}</wui-text>
      </wui-list-item>
    `:(this.style.cssText="display: none",null)}onGoToUpdateEmail(e,t){t||Q.RouterController.push("UpdateEmailWallet",{email:e,redirectView:"Account"})}getAuthName(e){return this.socialUsername?"discord"===this.socialProvider&&this.socialUsername.endsWith("0")?this.socialUsername.slice(0,-1):this.socialUsername:e.length>30?`${e.slice(0,-3)}...`:e}};es([(0,n.SB)()],el.prototype,"namespace",void 0),el=es([(0,p.Mo)("w3m-account-auth-button")],el);var ec=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let ed=class extends i.oi{constructor(){super(),this.usubscribe=[],this.networkImages=l.W.state.networkImages,this.address=d.AccountController.state.address,this.profileImage=d.AccountController.state.profileImage,this.profileName=d.AccountController.state.profileName,this.network=s.R.state.activeCaipNetwork,this.disconnecting=!1,this.loading=!1,this.switched=!1,this.text="",this.remoteFeatures=a.OptionsController.state.remoteFeatures,this.usubscribe.push(d.AccountController.subscribe(e=>{e.address&&(this.address=e.address,this.profileImage=e.profileImage,this.profileName=e.profileName)}),s.R.subscribeKey("activeCaipNetwork",e=>{e?.id&&(this.network=e)}),a.OptionsController.subscribeKey("remoteFeatures",e=>{this.remoteFeatures=e}))}disconnectedCallback(){this.usubscribe.forEach(e=>e())}render(){if(!this.address)throw Error("w3m-account-settings-view: No account provided");let e=this.networkImages[this.network?.assets?.imageId??""];return(0,i.dy)`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding=${["0","5","3","5"]}
      >
        <wui-avatar
          alt=${this.address}
          address=${this.address}
          imageSrc=${(0,r.o)(this.profileImage)}
          size="lg"
        ></wui-avatar>
        <wui-flex flexDirection="column" alignItems="center">
          <wui-flex gap="1" alignItems="center" justifyContent="center">
            <wui-text variant="h5-medium" color="primary" data-testid="account-settings-address">
              ${p.Hg.getTruncateString({string:this.address,charsStart:4,charsEnd:6,truncate:"middle"})}
            </wui-text>
            <wui-icon-link
              size="md"
              icon="copy"
              iconColor="default"
              @click=${this.onCopyAddress}
            ></wui-icon-link>
          </wui-flex>
        </wui-flex>
      </wui-flex>
      <wui-flex flexDirection="column" gap="4">
        <wui-flex flexDirection="column" gap="2" .padding=${["6","4","3","4"]}>
          ${this.authCardTemplate()}
          <w3m-account-auth-button></w3m-account-auth-button>
          <wui-list-item
            imageSrc=${(0,r.o)(e)}
            ?chevron=${this.isAllowedNetworkSwitch()}
            ?fullSize=${!0}
            ?rounded=${!0}
            @click=${this.onNetworks.bind(this)}
            data-testid="account-switch-network-button"
          >
            <wui-text variant="lg-regular" color="primary">
              ${this.network?.name??"Unknown"}
            </wui-text>
          </wui-list-item>
          ${this.togglePreferredAccountBtnTemplate()} ${this.chooseNameButtonTemplate()}
          <wui-list-item
            ?rounded=${!0}
            icon="power"
            iconColor="error"
            ?chevron=${!1}
            .loading=${this.disconnecting}
            @click=${this.onDisconnect.bind(this)}
            data-testid="disconnect-button"
          >
            <wui-text variant="lg-regular" color="primary">Disconnect</wui-text>
          </wui-list-item>
        </wui-flex>
      </wui-flex>
    `}chooseNameButtonTemplate(){let e=this.network?.chainNamespace,t=X.ConnectorController.getConnectorId(e),o=X.ConnectorController.getAuthConnector();return s.R.checkIfNamesSupported()&&o&&t===G.b.CONNECTOR_ID.AUTH&&!this.profileName?(0,i.dy)`
      <wui-list-item
        icon="id"
        ?rounded=${!0}
        ?chevron=${!0}
        @click=${this.onChooseName.bind(this)}
        data-testid="account-choose-name-button"
      >
        <wui-text variant="lg-regular" color="primary">Choose account name </wui-text>
      </wui-list-item>
    `:null}authCardTemplate(){let e=X.ConnectorController.getConnectorId(this.network?.chainNamespace),t=X.ConnectorController.getAuthConnector(),{origin:o}=location;return!t||e!==G.b.CONNECTOR_ID.AUTH||o.includes(Y.bq.SECURE_SITE)?null:(0,i.dy)`
      <wui-notice-card
        @click=${this.onGoToUpgradeView.bind(this)}
        label="Upgrade your wallet"
        description="Transition to a self-custodial wallet"
        icon="wallet"
        data-testid="w3m-wallet-upgrade-card"
      ></wui-notice-card>
    `}isAllowedNetworkSwitch(){let e=s.R.getAllRequestedCaipNetworks(),t=!!e&&e.length>1,o=e?.find(({id:e})=>e===this.network?.id);return t||!o}onCopyAddress(){try{this.address&&(u.j.copyToClopboard(this.address),Z.SnackController.showSuccess("Address copied"))}catch{Z.SnackController.showError("Failed to copy")}}togglePreferredAccountBtnTemplate(){let e=this.network?.chainNamespace,t=s.R.checkIfSmartAccountEnabled(),o=X.ConnectorController.getConnectorId(e);return X.ConnectorController.getAuthConnector()&&o===G.b.CONNECTOR_ID.AUTH&&t?(this.switched||(this.text=(0,J.r9)(e)===er.y_.ACCOUNT_TYPES.SMART_ACCOUNT?"Switch to your EOA":"Switch to your Smart Account"),(0,i.dy)`
      <wui-list-item
        icon="swapHorizontal"
        ?rounded=${!0}
        ?chevron=${!0}
        ?loading=${this.loading}
        @click=${this.changePreferredAccountType.bind(this)}
        data-testid="account-toggle-preferred-account-type"
      >
        <wui-text variant="lg-regular" color="primary">${this.text}</wui-text>
      </wui-list-item>
    `):null}onChooseName(){Q.RouterController.push("ChooseAccountName")}async changePreferredAccountType(){let e=this.network?.chainNamespace,t=s.R.checkIfSmartAccountEnabled(),o=(0,J.r9)(e)!==er.y_.ACCOUNT_TYPES.SMART_ACCOUNT&&t?er.y_.ACCOUNT_TYPES.SMART_ACCOUNT:er.y_.ACCOUNT_TYPES.EOA;X.ConnectorController.getAuthConnector()&&(this.loading=!0,await ee.ConnectionController.setPreferredAccountType(o,e),this.text=o===er.y_.ACCOUNT_TYPES.SMART_ACCOUNT?"Switch to your EOA":"Switch to your Smart Account",this.switched=!0,et.S.resetSend(),this.loading=!1,this.requestUpdate())}onNetworks(){this.isAllowedNetworkSwitch()&&Q.RouterController.push("Networks")}async onDisconnect(){try{this.disconnecting=!0;let e=this.network?.chainNamespace,t=ee.ConnectionController.getConnections(e).length>0,o=e&&X.ConnectorController.state.activeConnectorIds[e],i=this.remoteFeatures?.multiWallet;await ee.ConnectionController.disconnect(i?{id:o,namespace:e}:{}),t&&i&&(Q.RouterController.push("ProfileWallets"),Z.SnackController.showSuccess("Wallet deleted"))}catch{W.X.sendEvent({type:"track",event:"DISCONNECT_ERROR",properties:{message:"Failed to disconnect"}}),Z.SnackController.showError("Failed to disconnect")}finally{this.disconnecting=!1}}onGoToUpgradeView(){W.X.sendEvent({type:"track",event:"EMAIL_UPGRADE_FROM_MODAL"}),Q.RouterController.push("UpgradeEmailWallet")}};ec([(0,n.SB)()],ed.prototype,"address",void 0),ec([(0,n.SB)()],ed.prototype,"profileImage",void 0),ec([(0,n.SB)()],ed.prototype,"profileName",void 0),ec([(0,n.SB)()],ed.prototype,"network",void 0),ec([(0,n.SB)()],ed.prototype,"disconnecting",void 0),ec([(0,n.SB)()],ed.prototype,"loading",void 0),ec([(0,n.SB)()],ed.prototype,"switched",void 0),ec([(0,n.SB)()],ed.prototype,"text",void 0),ec([(0,n.SB)()],ed.prototype,"remoteFeatures",void 0),ed=ec([(0,p.Mo)("w3m-account-settings-view")],ed),o(37826),o(85642);var eu=(0,g.iv)`
  :host {
    flex: 1;
    height: 100%;
  }

  button {
    width: 100%;
    height: 100%;
    display: inline-flex;
    align-items: center;
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]};
    column-gap: ${({spacing:e})=>e[1]};
    color: ${({tokens:e})=>e.theme.textSecondary};
    border-radius: ${({borderRadius:e})=>e[20]};
    background-color: transparent;
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button[data-active='true'] {
    color: ${({tokens:e})=>e.theme.textPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundTertiary};
  }

  button:hover:enabled:not([data-active='true']),
  button:active:enabled:not([data-active='true']) {
    wui-text,
    wui-icon {
      color: ${({tokens:e})=>e.theme.textPrimary};
    }
  }
`,eh=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let ep={lg:"lg-regular",md:"md-regular",sm:"sm-regular"},ew={lg:"md",md:"sm",sm:"sm"},eb=class extends i.oi{constructor(){super(...arguments),this.icon="mobile",this.size="md",this.label="",this.active=!1}render(){return(0,i.dy)`
      <button data-active=${this.active}>
        ${this.icon?(0,i.dy)`<wui-icon size=${ew[this.size]} name=${this.icon}></wui-icon>`:""}
        <wui-text variant=${ep[this.size]}> ${this.label} </wui-text>
      </button>
    `}};eb.styles=[w.ET,w.ZM,eu],eh([(0,n.Cb)()],eb.prototype,"icon",void 0),eh([(0,n.Cb)()],eb.prototype,"size",void 0),eh([(0,n.Cb)()],eb.prototype,"label",void 0),eh([(0,n.Cb)({type:Boolean})],eb.prototype,"active",void 0),eb=eh([(0,m.M)("wui-tab-item")],eb);var em=(0,g.iv)`
  :host {
    display: inline-flex;
    align-items: center;
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    border-radius: ${({borderRadius:e})=>e[32]};
    padding: ${({spacing:e})=>e["01"]};
    box-sizing: border-box;
  }

  :host([data-size='sm']) {
    height: 26px;
  }

  :host([data-size='md']) {
    height: 36px;
  }
`,eg=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let ef=class extends i.oi{constructor(){super(...arguments),this.tabs=[],this.onTabChange=()=>null,this.size="md",this.activeTab=0}render(){return this.dataset.size=this.size,this.tabs.map((e,t)=>{let o=t===this.activeTab;return(0,i.dy)`
        <wui-tab-item
          @click=${()=>this.onTabClick(t)}
          icon=${e.icon}
          size=${this.size}
          label=${e.label}
          ?active=${o}
          data-active=${o}
          data-testid="tab-${e.label?.toLowerCase()}"
        ></wui-tab-item>
      `})}onTabClick(e){this.activeTab=e,this.onTabChange(e)}};ef.styles=[w.ET,w.ZM,em],eg([(0,n.Cb)({type:Array})],ef.prototype,"tabs",void 0),eg([(0,n.Cb)()],ef.prototype,"onTabChange",void 0),eg([(0,n.Cb)()],ef.prototype,"size",void 0),eg([(0,n.SB)()],ef.prototype,"activeTab",void 0),ef=eg([(0,m.M)("wui-tabs")],ef),o(70990);var ey=(0,g.iv)`
  button {
    display: flex;
    align-items: center;
    height: 40px;
    padding: ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[4]};
    column-gap: ${({spacing:e})=>e[1]};
    background-color: transparent;
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
  }

  wui-image,
  .icon-box {
    width: ${({spacing:e})=>e[6]};
    height: ${({spacing:e})=>e[6]};
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-text {
    flex: 1;
  }

  .icon-box {
    position: relative;
  }

  .icon-box[data-active='true'] {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  .circle {
    position: absolute;
    left: 16px;
    top: 15px;
    width: 8px;
    height: 8px;
    background-color: ${({tokens:e})=>e.core.textSuccess};
    box-shadow: 0 0 0 2px ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: 50%;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) {
    button:hover:enabled,
    button:active:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }
  }
`,eC=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let ev=class extends i.oi{constructor(){super(...arguments),this.address="",this.profileName="",this.alt="",this.imageSrc="",this.icon=void 0,this.iconSize="md",this.loading=!1,this.charsStart=4,this.charsEnd=6}render(){return(0,i.dy)`
      <button>
        ${this.leftImageTemplate()} ${this.textTemplate()} ${this.rightImageTemplate()}
      </button>
    `}leftImageTemplate(){let e=this.icon?(0,i.dy)`<wui-icon
          size=${(0,r.o)(this.iconSize)}
          color="default"
          name=${this.icon}
          class="icon"
        ></wui-icon>`:(0,i.dy)`<wui-image src=${this.imageSrc} alt=${this.alt}></wui-image>`;return(0,i.dy)`
      <wui-flex
        alignItems="center"
        justifyContent="center"
        class="icon-box"
        data-active=${!!this.icon}
      >
        ${e}
        <wui-flex class="circle"></wui-flex>
      </wui-flex>
    `}textTemplate(){return(0,i.dy)`
      <wui-text variant="lg-regular" color="primary">
        ${b.H.getTruncateString({string:this.profileName||this.address,charsStart:this.profileName?16:this.charsStart,charsEnd:this.profileName?0:this.charsEnd,truncate:this.profileName?"end":"middle"})}
      </wui-text>
    `}rightImageTemplate(){return(0,i.dy)`<wui-icon name="chevronBottom" size="sm" color="default"></wui-icon>`}};ev.styles=[w.ET,w.ZM,ey],eC([(0,n.Cb)()],ev.prototype,"address",void 0),eC([(0,n.Cb)()],ev.prototype,"profileName",void 0),eC([(0,n.Cb)()],ev.prototype,"alt",void 0),eC([(0,n.Cb)()],ev.prototype,"imageSrc",void 0),eC([(0,n.Cb)()],ev.prototype,"icon",void 0),eC([(0,n.Cb)()],ev.prototype,"iconSize",void 0),eC([(0,n.Cb)({type:Boolean})],ev.prototype,"loading",void 0),eC([(0,n.Cb)({type:Number})],ev.prototype,"charsStart",void 0),eC([(0,n.Cb)({type:Number})],ev.prototype,"charsEnd",void 0),ev=eC([(0,m.M)("wui-wallet-switch")],ev);var ex=(0,p.iv)`
  wui-icon-link {
    margin-right: calc(${({spacing:e})=>e["8"]} * -1);
  }

  wui-notice-card {
    margin-bottom: ${({spacing:e})=>e["1"]};
  }

  wui-list-item > wui-text {
    flex: 1;
  }

  w3m-transactions-view {
    max-height: 200px;
  }

  .tab-content-container {
    height: 300px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  .tab-content-container::-webkit-scrollbar {
    display: none;
  }

  .account-button {
    width: auto;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:e})=>e["3"]};
    height: 48px;
    padding: ${({spacing:e})=>e["2"]};
    padding-right: ${({spacing:e})=>e["3"]};
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[6]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
  }

  .account-button:hover {
    background-color: ${({tokens:e})=>e.core.glass010};
  }

  .avatar-container {
    position: relative;
  }

  wui-avatar.avatar {
    width: 32px;
    height: 32px;
    box-shadow: 0 0 0 2px ${({tokens:e})=>e.core.glass010};
  }

  wui-wallet-switch {
    margin-top: ${({spacing:e})=>e["2"]};
  }

  wui-avatar.network-avatar {
    width: 16px;
    height: 16px;
    position: absolute;
    left: 100%;
    top: 100%;
    transform: translate(-75%, -75%);
    box-shadow: 0 0 0 2px ${({tokens:e})=>e.core.glass010};
  }

  .account-links {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .account-links wui-flex {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    background: red;
    align-items: center;
    justify-content: center;
    height: 48px;
    padding: 10px;
    flex: 1 0 0;
    border-radius: var(--XS, 16px);
    border: 1px solid var(--dark-accent-glass-010, rgba(71, 161, 255, 0.1));
    background: var(--dark-accent-glass-010, rgba(71, 161, 255, 0.1));
    transition:
      background-color ${({durations:e})=>e.md}
        ${({easings:e})=>e["ease-out-power-1"]},
      opacity ${({durations:e})=>e.md} ${({easings:e})=>e["ease-out-power-1"]};
    will-change: background-color, opacity;
  }

  .account-links wui-flex:hover {
    background: var(--dark-accent-glass-015, rgba(71, 161, 255, 0.15));
  }

  .account-links wui-flex wui-icon {
    width: var(--S, 20px);
    height: var(--S, 20px);
  }

  .account-links wui-flex wui-icon svg path {
    stroke: #667dff;
  }
`,e$=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let ek=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.caipAddress=d.AccountController.state.caipAddress,this.address=u.j.getPlainAddress(d.AccountController.state.caipAddress),this.profileImage=d.AccountController.state.profileImage,this.profileName=d.AccountController.state.profileName,this.disconnecting=!1,this.balance=d.AccountController.state.balance,this.balanceSymbol=d.AccountController.state.balanceSymbol,this.features=a.OptionsController.state.features,this.remoteFeatures=a.OptionsController.state.remoteFeatures,this.namespace=s.R.state.activeChain,this.activeConnectorIds=X.ConnectorController.state.activeConnectorIds,this.unsubscribe.push(d.AccountController.subscribeKey("caipAddress",e=>{this.address=u.j.getPlainAddress(e),this.caipAddress=e}),d.AccountController.subscribeKey("balance",e=>this.balance=e),d.AccountController.subscribeKey("balanceSymbol",e=>this.balanceSymbol=e),d.AccountController.subscribeKey("profileName",e=>this.profileName=e),d.AccountController.subscribeKey("profileImage",e=>this.profileImage=e),a.OptionsController.subscribeKey("features",e=>this.features=e),a.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e),X.ConnectorController.subscribeKey("activeConnectorIds",e=>{this.activeConnectorIds=e}),s.R.subscribeKey("activeChain",e=>this.namespace=e),s.R.subscribeKey("activeCaipNetwork",e=>{e?.chainNamespace&&(this.namespace=e?.chainNamespace)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(!this.caipAddress||!this.namespace)return null;let e=this.activeConnectorIds[this.namespace],t=e?X.ConnectorController.getConnectorById(e):void 0,o=c.f.getConnectorImage(t),{value:n,decimals:a,symbol:s}=u.j.parseBalance(this.balance,this.balanceSymbol);return(0,i.dy)`<wui-flex
        flexDirection="column"
        .padding=${["0","5","4","5"]}
        alignItems="center"
        gap="3"
      >
        <wui-avatar
          alt=${(0,r.o)(this.caipAddress)}
          address=${(0,r.o)(u.j.getPlainAddress(this.caipAddress))}
          imageSrc=${(0,r.o)(null===this.profileImage?void 0:this.profileImage)}
          data-testid="single-account-avatar"
        ></wui-avatar>
        <wui-wallet-switch
          profileName=${this.profileName}
          address=${this.address}
          imageSrc=${o}
          alt=${t?.name}
          @click=${this.onGoToProfileWalletsView.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>
        <wui-flex flexDirection="row" alignItems="flex-end" justifyContent="center" gap="1">
          <wui-text variant="h3-regular" color="primary">${n}</wui-text>
          <wui-text variant="h3-regular" color="secondary">.${a}</wui-text>
          <wui-text variant="h6-medium" color="primary">${s}</wui-text>
        </wui-flex>
        ${this.explorerBtnTemplate()}
      </wui-flex>

      <wui-flex flexDirection="column" gap="2" .padding=${["0","3","3","3"]}>
        ${this.authCardTemplate()} <w3m-account-auth-button></w3m-account-auth-button>
        ${this.orderedFeaturesTemplate()} ${this.activityTemplate()}
        <wui-list-item
          .rounded=${!0}
          icon="power"
          iconColor="error"
          ?chevron=${!1}
          .loading=${this.disconnecting}
          .rightIcon=${!1}
          @click=${this.onDisconnect.bind(this)}
          data-testid="disconnect-button"
        >
          <wui-text variant="lg-regular" color="primary">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>`}fundWalletTemplate(){if(!this.namespace)return null;let e=Y.bq.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(this.namespace),t=Y.bq.PAY_WITH_EXCHANGE_SUPPORTED_CHAIN_NAMESPACES.includes(this.namespace),o=!!this.features?.receive,n=this.remoteFeatures?.onramp&&e,r=this.remoteFeatures?.payWithExchange&&t;return n||o||r?(0,i.dy)`
      <wui-list-item
        .rounded=${!0}
        data-testid="w3m-account-default-fund-wallet-button"
        iconVariant="blue"
        icon="dollar"
        ?chevron=${!0}
        @click=${this.handleClickFundWallet.bind(this)}
      >
        <wui-text variant="lg-regular" color="primary">Fund wallet</wui-text>
      </wui-list-item>
    `:null}orderedFeaturesTemplate(){return(this.features?.walletFeaturesOrder||Y.bq.DEFAULT_FEATURES.walletFeaturesOrder).map(e=>{switch(e){case"onramp":return this.fundWalletTemplate();case"swaps":return this.swapsTemplate();case"send":return this.sendTemplate();default:return null}})}activityTemplate(){return this.namespace&&this.remoteFeatures?.activity&&Y.bq.ACTIVITY_ENABLED_CHAIN_NAMESPACES.includes(this.namespace)?(0,i.dy)` <wui-list-item
          .rounded=${!0}
          icon="clock"
          ?chevron=${!0}
          @click=${this.onTransactions.bind(this)}
          data-testid="w3m-account-default-activity-button"
        >
          <wui-text variant="lg-regular" color="primary">Activity</wui-text>
        </wui-list-item>`:null}swapsTemplate(){let e=this.remoteFeatures?.swaps,t=s.R.state.activeChain===G.b.CHAIN.EVM;return e&&t?(0,i.dy)`
      <wui-list-item
        .rounded=${!0}
        icon="recycleHorizontal"
        ?chevron=${!0}
        @click=${this.handleClickSwap.bind(this)}
        data-testid="w3m-account-default-swaps-button"
      >
        <wui-text variant="lg-regular" color="primary">Swap</wui-text>
      </wui-list-item>
    `:null}sendTemplate(){let e=this.features?.send,t=s.R.state.activeChain;if(!t)throw Error("SendController:sendTemplate - namespace is required");let o=Y.bq.SEND_SUPPORTED_NAMESPACES.includes(t);return e&&o?(0,i.dy)`
      <wui-list-item
        .rounded=${!0}
        icon="send"
        ?chevron=${!0}
        @click=${this.handleClickSend.bind(this)}
        data-testid="w3m-account-default-send-button"
      >
        <wui-text variant="lg-regular" color="primary">Send</wui-text>
      </wui-list-item>
    `:null}authCardTemplate(){let e=s.R.state.activeChain;if(!e)throw Error("AuthCardTemplate:authCardTemplate - namespace is required");let t=X.ConnectorController.getConnectorId(e),o=X.ConnectorController.getAuthConnector(),{origin:n}=location;return!o||t!==G.b.CONNECTOR_ID.AUTH||n.includes(Y.bq.SECURE_SITE)?null:(0,i.dy)`
      <wui-notice-card
        @click=${this.onGoToUpgradeView.bind(this)}
        label="Upgrade your wallet"
        description="Transition to a self-custodial wallet"
        icon="wallet"
        data-testid="w3m-wallet-upgrade-card"
      ></wui-notice-card>
    `}handleClickFundWallet(){Q.RouterController.push("FundWallet")}handleClickSwap(){Q.RouterController.push("Swap")}handleClickSend(){Q.RouterController.push("WalletSend")}explorerBtnTemplate(){return d.AccountController.state.addressExplorerUrl?(0,i.dy)`
      <wui-button size="md" variant="accent-primary" @click=${this.onExplorer.bind(this)}>
        <wui-icon size="sm" color="inherit" slot="iconLeft" name="compass"></wui-icon>
        Block Explorer
        <wui-icon size="sm" color="inherit" slot="iconRight" name="externalLink"></wui-icon>
      </wui-button>
    `:null}onTransactions(){W.X.sendEvent({type:"track",event:"CLICK_TRANSACTIONS",properties:{isSmartAccount:(0,J.r9)(s.R.state.activeChain)===er.y_.ACCOUNT_TYPES.SMART_ACCOUNT}}),Q.RouterController.push("Transactions")}async onDisconnect(){try{this.disconnecting=!0;let e=ee.ConnectionController.getConnections(this.namespace).length>0,t=this.namespace&&X.ConnectorController.state.activeConnectorIds[this.namespace],o=this.remoteFeatures?.multiWallet;await ee.ConnectionController.disconnect(o?{id:t,namespace:this.namespace}:{}),e&&o&&(Q.RouterController.push("ProfileWallets"),Z.SnackController.showSuccess("Wallet deleted"))}catch{W.X.sendEvent({type:"track",event:"DISCONNECT_ERROR",properties:{message:"Failed to disconnect"}}),Z.SnackController.showError("Failed to disconnect")}finally{this.disconnecting=!1}}onExplorer(){let e=d.AccountController.state.addressExplorerUrl;e&&u.j.openHref(e,"_blank")}onGoToUpgradeView(){W.X.sendEvent({type:"track",event:"EMAIL_UPGRADE_FROM_MODAL"}),Q.RouterController.push("UpgradeEmailWallet")}onGoToProfileWalletsView(){Q.RouterController.push("ProfileWallets")}};ek.styles=ex,e$([(0,n.SB)()],ek.prototype,"caipAddress",void 0),e$([(0,n.SB)()],ek.prototype,"address",void 0),e$([(0,n.SB)()],ek.prototype,"profileImage",void 0),e$([(0,n.SB)()],ek.prototype,"profileName",void 0),e$([(0,n.SB)()],ek.prototype,"disconnecting",void 0),e$([(0,n.SB)()],ek.prototype,"balance",void 0),e$([(0,n.SB)()],ek.prototype,"balanceSymbol",void 0),e$([(0,n.SB)()],ek.prototype,"features",void 0),e$([(0,n.SB)()],ek.prototype,"remoteFeatures",void 0),e$([(0,n.SB)()],ek.prototype,"namespace",void 0),e$([(0,n.SB)()],ek.prototype,"activeConnectorIds",void 0),ek=e$([(0,p.Mo)("w3m-account-default-widget")],ek);var eS=(0,g.iv)`
  span {
    font-weight: 500;
    font-size: 38px;
    color: ${({tokens:e})=>e.theme.textPrimary};
    line-height: 38px;
    letter-spacing: -2%;
    text-align: center;
    font-family: var(--apkt-fontFamily-regular);
  }

  .pennies {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }
`,eR=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let eE=class extends i.oi{constructor(){super(...arguments),this.dollars="0",this.pennies="00"}render(){return(0,i.dy)`<span>$${this.dollars}<span class="pennies">.${this.pennies}</span></span>`}};eE.styles=[w.ET,eS],eR([(0,n.Cb)()],eE.prototype,"dollars",void 0),eR([(0,n.Cb)()],eE.prototype,"pennies",void 0),eE=eR([(0,m.M)("wui-balance")],eE);var eA=(0,g.iv)`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  wui-icon {
    position: absolute;
    width: 12px !important;
    height: 4px !important;
  }

  /* -- Variants --------------------------------------------------------- */
  :host([data-variant='fill']) {
    background-color: ${({colors:e})=>e.neutrals100};
  }

  :host([data-variant='shade']) {
    background-color: ${({colors:e})=>e.neutrals900};
  }

  :host([data-variant='fill']) > wui-text {
    color: ${({colors:e})=>e.black};
  }

  :host([data-variant='shade']) > wui-text {
    color: ${({colors:e})=>e.white};
  }

  :host([data-variant='fill']) > wui-icon {
    color: ${({colors:e})=>e.neutrals100};
  }

  :host([data-variant='shade']) > wui-icon {
    color: ${({colors:e})=>e.neutrals900};
  }

  /* -- Sizes --------------------------------------------------------- */
  :host([data-size='sm']) {
    padding: ${({spacing:e})=>e[1]} ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  :host([data-size='md']) {
    padding: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[3]};
  }

  /* -- Placements --------------------------------------------------------- */
  wui-icon[data-placement='top'] {
    bottom: 0px;
    left: 50%;
    transform: translate(-50%, 95%);
  }

  wui-icon[data-placement='bottom'] {
    top: 0;
    left: 50%;
    transform: translate(-50%, -95%) rotate(180deg);
  }

  wui-icon[data-placement='right'] {
    top: 50%;
    left: 0;
    transform: translate(-65%, -50%) rotate(90deg);
  }

  wui-icon[data-placement='left'] {
    top: 50%;
    right: 0%;
    transform: translate(65%, -50%) rotate(270deg);
  }
`,eI=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let eT={sm:"sm-regular",md:"md-regular"},eO=class extends i.oi{constructor(){super(...arguments),this.placement="top",this.variant="fill",this.size="md",this.message=""}render(){return this.dataset.variant=this.variant,this.dataset.size=this.size,(0,i.dy)`<wui-icon data-placement=${this.placement} size="inherit" name="cursor"></wui-icon>
      <wui-text variant=${eT[this.size]}>${this.message}</wui-text>`}};eO.styles=[w.ET,w.ZM,eA],eI([(0,n.Cb)()],eO.prototype,"placement",void 0),eI([(0,n.Cb)()],eO.prototype,"variant",void 0),eI([(0,n.Cb)()],eO.prototype,"size",void 0),eI([(0,n.Cb)()],eO.prototype,"message",void 0),eO=eI([(0,m.M)("wui-tooltip")],eO);var eN=o(11697),ej=o(26249);o(55222);var eP=(0,i.iv)`
  :host {
    width: 100%;
    max-height: 280px;
    overflow: scroll;
    scrollbar-width: none;
  }

  :host::-webkit-scrollbar {
    display: none;
  }
`;let eB=class extends i.oi{render(){return(0,i.dy)`<w3m-activity-list page="account"></w3m-activity-list>`}};eB.styles=eP,eB=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a}([(0,p.Mo)("w3m-account-activity-widget")],eB),o(85185);var eD=(0,g.iv)`
  :host {
    width: 100%;
  }

  button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${({spacing:e})=>e[4]};
    padding: ${({spacing:e})=>e[4]};
    background-color: transparent;
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  wui-text {
    max-width: 174px;
  }

  .tag-container {
    width: fit-content;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    }
  }
`,eW=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let eL=class extends i.oi{constructor(){super(...arguments),this.icon="card",this.text="",this.description="",this.tag=void 0,this.disabled=!1}render(){return(0,i.dy)`
      <button ?disabled=${this.disabled}>
        <wui-flex alignItems="center" gap="3">
          <wui-icon-box padding="2" color="secondary" icon=${this.icon} size="lg"></wui-icon-box>
          <wui-flex flexDirection="column" gap="1">
            <wui-text variant="md-medium" color="primary">${this.text}</wui-text>
            ${this.description?(0,i.dy)`<wui-text variant="md-regular" color="secondary">
                  ${this.description}</wui-text
                >`:null}
          </wui-flex>
        </wui-flex>

        <wui-flex class="tag-container" alignItems="center" gap="1" justifyContent="flex-end">
          ${this.tag?(0,i.dy)`<wui-tag tagType="main" size="sm">${this.tag}</wui-tag>`:null}
          <wui-icon size="md" name="chevronRight" color="default"></wui-icon>
        </wui-flex>
      </button>
    `}};eL.styles=[w.ET,w.ZM,eD],eW([(0,n.Cb)()],eL.prototype,"icon",void 0),eW([(0,n.Cb)()],eL.prototype,"text",void 0),eW([(0,n.Cb)()],eL.prototype,"description",void 0),eW([(0,n.Cb)()],eL.prototype,"tag",void 0),eW([(0,n.Cb)({type:Boolean})],eL.prototype,"disabled",void 0),eL=eW([(0,m.M)("wui-list-description")],eL),o(87204);var eM=(0,i.iv)`
  :host {
    width: 100%;
  }

  wui-flex {
    width: 100%;
  }

  .contentContainer {
    max-height: 280px;
    overflow: scroll;
    scrollbar-width: none;
  }

  .contentContainer::-webkit-scrollbar {
    display: none;
  }
`,e_=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let ez=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.tokenBalance=d.AccountController.state.tokenBalance,this.remoteFeatures=a.OptionsController.state.remoteFeatures,this.unsubscribe.push(d.AccountController.subscribe(e=>{this.tokenBalance=e.tokenBalance}),a.OptionsController.subscribeKey("remoteFeatures",e=>{this.remoteFeatures=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return(0,i.dy)`${this.tokenTemplate()}`}tokenTemplate(){return this.tokenBalance&&this.tokenBalance?.length>0?(0,i.dy)`<wui-flex class="contentContainer" flexDirection="column" gap="2">
        ${this.tokenItemTemplate()}
      </wui-flex>`:(0,i.dy)` <wui-flex flexDirection="column">
      ${this.onRampTemplate()}
      <wui-list-description
        @click=${this.onReceiveClick.bind(this)}
        text="Receive funds"
        description="Scan the QR code and receive funds"
        icon="qrCode"
        iconColor="fg-200"
        iconBackgroundColor="fg-200"
        data-testid="w3m-account-receive-button"
      ></wui-list-description
    ></wui-flex>`}onRampTemplate(){return this.remoteFeatures?.onramp?(0,i.dy)`<wui-list-description
        @click=${this.onBuyClick.bind(this)}
        text="Buy Crypto"
        description="Easy with card or bank account"
        icon="card"
        iconColor="success-100"
        iconBackgroundColor="success-100"
        tag="popular"
        data-testid="w3m-account-onramp-button"
      ></wui-list-description>`:(0,i.dy)``}tokenItemTemplate(){return this.tokenBalance?.map(e=>i.dy`<wui-list-token
          tokenName=${e.name}
          tokenImageUrl=${e.iconUrl}
          tokenAmount=${e.quantity.numeric}
          tokenValue=${e.value}
          tokenCurrency=${e.symbol}
        ></wui-list-token>`)}onReceiveClick(){Q.RouterController.push("WalletReceive")}onBuyClick(){W.X.sendEvent({type:"track",event:"SELECT_BUY_CRYPTO",properties:{isSmartAccount:(0,J.r9)(s.R.state.activeChain)===er.y_.ACCOUNT_TYPES.SMART_ACCOUNT}}),Q.RouterController.push("OnRampProviders")}};ez.styles=eM,e_([(0,n.SB)()],ez.prototype,"tokenBalance",void 0),e_([(0,n.SB)()],ez.prototype,"remoteFeatures",void 0),ez=e_([(0,p.Mo)("w3m-account-tokens-widget")],ez),o(71799),o(30553);var eU=(0,p.iv)`
  wui-flex {
    width: 100%;
  }

  wui-promo {
    position: absolute;
    top: -32px;
  }

  wui-profile-button {
    margin-top: calc(-1 * ${({spacing:e})=>e["4"]});
  }

  wui-promo + wui-profile-button {
    margin-top: ${({spacing:e})=>e["4"]};
  }

  wui-tabs {
    width: 100%;
  }

  .contentContainer {
    height: 280px;
  }

  .contentContainer > wui-icon-box {
    width: 40px;
    height: 40px;
    border-radius: ${({borderRadius:e})=>e["3"]};
  }

  .contentContainer > .textContent {
    width: 65%;
  }
`,eF=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let eV=class extends i.oi{constructor(){super(...arguments),this.unsubscribe=[],this.address=d.AccountController.state.address,this.profileName=d.AccountController.state.profileName,this.network=s.R.state.activeCaipNetwork,this.currentTab=d.AccountController.state.currentTab,this.tokenBalance=d.AccountController.state.tokenBalance,this.features=a.OptionsController.state.features,this.namespace=s.R.state.activeChain,this.activeConnectorIds=X.ConnectorController.state.activeConnectorIds,this.remoteFeatures=a.OptionsController.state.remoteFeatures}firstUpdated(){d.AccountController.fetchTokenBalance(),this.unsubscribe.push(d.AccountController.subscribe(e=>{e.address?(this.address=e.address,this.profileName=e.profileName,this.currentTab=e.currentTab,this.tokenBalance=e.tokenBalance):h.I.close()}),X.ConnectorController.subscribeKey("activeConnectorIds",e=>{this.activeConnectorIds=e}),s.R.subscribeKey("activeChain",e=>this.namespace=e),s.R.subscribeKey("activeCaipNetwork",e=>this.network=e),a.OptionsController.subscribeKey("features",e=>this.features=e),a.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e)),this.watchSwapValues()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),clearInterval(this.watchTokenBalance)}render(){if(!this.address)throw Error("w3m-account-view: No account provided");if(!this.namespace)return null;let e=this.activeConnectorIds[this.namespace],t=e?X.ConnectorController.getConnectorById(e):void 0,{icon:o,iconSize:n}=this.getAuthData();return(0,i.dy)`<wui-flex
      flexDirection="column"
      .padding=${["0","3","4","3"]}
      alignItems="center"
      gap="4"
      data-testid="w3m-account-wallet-features-widget"
    >
      <wui-flex flexDirection="column" justifyContent="center" alignItems="center" gap="2">
        <wui-wallet-switch
          profileName=${this.profileName}
          address=${this.address}
          icon=${o}
          iconSize=${n}
          alt=${t?.name}
          @click=${this.onGoToProfileWalletsView.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>

        ${this.tokenBalanceTemplate()}
      </wui-flex>
      ${this.orderedWalletFeatures()} ${this.tabsTemplate()} ${this.listContentTemplate()}
    </wui-flex>`}orderedWalletFeatures(){let e=this.features?.walletFeaturesOrder||Y.bq.DEFAULT_FEATURES.walletFeaturesOrder;if(e.every(e=>"send"===e||"receive"===e?!this.features?.[e]:"swaps"!==e&&"onramp"!==e||!this.remoteFeatures?.[e]))return null;let t=[...new Set(e.map(e=>"receive"===e||"onramp"===e?"fund":e))];return(0,i.dy)`<wui-flex gap="2">
      ${t.map(e=>{switch(e){case"fund":return this.fundWalletTemplate();case"swaps":return this.swapsTemplate();case"send":return this.sendTemplate();default:return null}})}
    </wui-flex>`}fundWalletTemplate(){if(!this.namespace)return null;let e=Y.bq.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(this.namespace),t=Y.bq.PAY_WITH_EXCHANGE_SUPPORTED_CHAIN_NAMESPACES.includes(this.namespace),o=this.features?.receive,n=this.remoteFeatures?.onramp&&e,r=this.remoteFeatures?.payWithExchange&&t;return n||o||r?(0,i.dy)`
      <w3m-tooltip-trigger text="Fund wallet">
        <wui-button
          data-testid="wallet-features-fund-wallet-button"
          @click=${this.onFundWalletClick.bind(this)}
          variant="accent-secondary"
          size="lg"
          fullWidth
        >
          <wui-icon name="dollar"></wui-icon>
        </wui-button>
      </w3m-tooltip-trigger>
    `:null}swapsTemplate(){let e=this.remoteFeatures?.swaps,t=s.R.state.activeChain===G.b.CHAIN.EVM;return e&&t?(0,i.dy)`
      <w3m-tooltip-trigger text="Swap">
        <wui-button
          fullWidth
          data-testid="wallet-features-swaps-button"
          @click=${this.onSwapClick.bind(this)}
          variant="accent-secondary"
          size="lg"
        >
          <wui-icon name="recycleHorizontal"></wui-icon>
        </wui-button>
      </w3m-tooltip-trigger>
    `:null}sendTemplate(){let e=this.features?.send,t=s.R.state.activeChain,o=Y.bq.SEND_SUPPORTED_NAMESPACES.includes(t);return e&&o?(0,i.dy)`
      <w3m-tooltip-trigger text="Send">
        <wui-button
          fullWidth
          data-testid="wallet-features-send-button"
          @click=${this.onSendClick.bind(this)}
          variant="accent-secondary"
          size="lg"
        >
          <wui-icon name="send"></wui-icon>
        </wui-button>
      </w3m-tooltip-trigger>
    `:null}watchSwapValues(){this.watchTokenBalance=setInterval(()=>d.AccountController.fetchTokenBalance(e=>this.onTokenBalanceError(e)),1e4)}onTokenBalanceError(e){e instanceof Error&&e.cause instanceof Response&&e.cause.status===G.b.HTTP_STATUS_CODES.SERVICE_UNAVAILABLE&&clearInterval(this.watchTokenBalance)}listContentTemplate(){return 0===this.currentTab?(0,i.dy)`<w3m-account-tokens-widget></w3m-account-tokens-widget>`:1===this.currentTab?(0,i.dy)`<w3m-account-activity-widget></w3m-account-activity-widget>`:(0,i.dy)`<w3m-account-tokens-widget></w3m-account-tokens-widget>`}tokenBalanceTemplate(){if(this.tokenBalance&&this.tokenBalance?.length>=0){let e=u.j.calculateBalance(this.tokenBalance),{dollars:t="0",pennies:o="00"}=u.j.formatTokenBalance(e);return(0,i.dy)`<wui-balance dollars=${t} pennies=${o}></wui-balance>`}return(0,i.dy)`<wui-balance dollars="0" pennies="00"></wui-balance>`}tabsTemplate(){let e=ej.g.getTabsByNamespace(s.R.state.activeChain);return 0===e.length?null:(0,i.dy)`<wui-tabs
      .onTabChange=${this.onTabChange.bind(this)}
      .activeTab=${this.currentTab}
      .tabs=${e}
    ></wui-tabs>`}onTabChange(e){d.AccountController.setCurrentTab(e)}onFundWalletClick(){Q.RouterController.push("FundWallet")}onSwapClick(){this.network?.caipNetworkId&&!Y.bq.SWAP_SUPPORTED_NETWORKS.includes(this.network?.caipNetworkId)?Q.RouterController.push("UnsupportedChain",{swapUnsupportedChain:!0}):(W.X.sendEvent({type:"track",event:"OPEN_SWAP",properties:{network:this.network?.caipNetworkId||"",isSmartAccount:(0,J.r9)(s.R.state.activeChain)===er.y_.ACCOUNT_TYPES.SMART_ACCOUNT}}),Q.RouterController.push("Swap"))}getAuthData(){let e=ea.M.getConnectedSocialProvider(),t=ea.M.getConnectedSocialUsername(),o=X.ConnectorController.getAuthConnector(),i=o?.provider.getEmail()??"";return{name:eN.C.getAuthName({email:i,socialUsername:t,socialProvider:e}),icon:e??"mail",iconSize:e?"xl":"md"}}onGoToProfileWalletsView(){Q.RouterController.push("ProfileWallets")}onSendClick(){W.X.sendEvent({type:"track",event:"OPEN_SEND",properties:{network:this.network?.caipNetworkId||"",isSmartAccount:(0,J.r9)(s.R.state.activeChain)===er.y_.ACCOUNT_TYPES.SMART_ACCOUNT}}),Q.RouterController.push("WalletSend")}};eV.styles=eU,eF([(0,n.SB)()],eV.prototype,"watchTokenBalance",void 0),eF([(0,n.SB)()],eV.prototype,"address",void 0),eF([(0,n.SB)()],eV.prototype,"profileName",void 0),eF([(0,n.SB)()],eV.prototype,"network",void 0),eF([(0,n.SB)()],eV.prototype,"currentTab",void 0),eF([(0,n.SB)()],eV.prototype,"tokenBalance",void 0),eF([(0,n.SB)()],eV.prototype,"features",void 0),eF([(0,n.SB)()],eV.prototype,"namespace",void 0),eF([(0,n.SB)()],eV.prototype,"activeConnectorIds",void 0),eF([(0,n.SB)()],eV.prototype,"remoteFeatures",void 0),eV=eF([(0,p.Mo)("w3m-account-wallet-features-widget")],eV);var eH=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let eK=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.namespace=s.R.state.activeChain,this.unsubscribe.push(s.R.subscribeKey("activeChain",e=>{this.namespace=e}))}render(){if(!this.namespace)return null;let e=X.ConnectorController.getConnectorId(this.namespace),t=X.ConnectorController.getAuthConnector();return(0,i.dy)`
      ${t&&e===G.b.CONNECTOR_ID.AUTH?this.walletFeaturesTemplate():this.defaultTemplate()}
    `}walletFeaturesTemplate(){return(0,i.dy)`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`}defaultTemplate(){return(0,i.dy)`<w3m-account-default-widget></w3m-account-default-widget>`}};eH([(0,n.SB)()],eK.prototype,"namespace",void 0),eK=eH([(0,p.Mo)("w3m-account-view")],eK);var eq=o(98536),eG=o(50738),eX=o(59580);o(42672),o(55018);var eY=(0,g.iv)`
  wui-image {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  wui-image,
  .icon-box {
    width: 32px;
    height: 32px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  wui-icon:not(.custom-icon, .icon-badge) {
    cursor: pointer;
  }

  .icon-box {
    position: relative;
    border-radius: ${({borderRadius:e})=>e[2]};
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  .icon-badge {
    position: absolute;
    top: 18px;
    left: 23px;
    z-index: 3;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
    border-radius: 50%;
    padding: ${({spacing:e})=>e["01"]};
  }

  .icon-badge {
    width: 8px;
    height: 8px;
  }
`,eZ=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let eJ=class extends i.oi{constructor(){super(...arguments),this.address="",this.profileName="",this.content=[],this.alt="",this.imageSrc="",this.icon=void 0,this.iconSize="md",this.iconBadge=void 0,this.iconBadgeSize="md",this.buttonVariant="neutral-primary",this.enableMoreButton=!1,this.charsStart=4,this.charsEnd=6}render(){return(0,i.dy)`
      <wui-flex flexDirection="column" rowgap="2">
        ${this.topTemplate()} ${this.bottomTemplate()}
      </wui-flex>
    `}topTemplate(){return(0,i.dy)`
      <wui-flex alignItems="flex-start" justifyContent="space-between">
        ${this.imageOrIconTemplate()}
        <wui-icon-link
          variant="secondary"
          size="md"
          icon="copy"
          @click=${this.dispatchCopyEvent}
        ></wui-icon-link>
        <wui-icon-link
          variant="secondary"
          size="md"
          icon="externalLink"
          @click=${this.dispatchExternalLinkEvent}
        ></wui-icon-link>
        ${this.enableMoreButton?(0,i.dy)`<wui-icon-link
              variant="secondary"
              size="md"
              icon="threeDots"
              @click=${this.dispatchMoreButtonEvent}
              data-testid="wui-active-profile-wallet-item-more-button"
            ></wui-icon-link>`:null}
      </wui-flex>
    `}bottomTemplate(){return(0,i.dy)` <wui-flex flexDirection="column">${this.contentTemplate()}</wui-flex> `}imageOrIconTemplate(){return this.icon?(0,i.dy)`
        <wui-flex flexGrow="1" alignItems="center">
          <wui-flex alignItems="center" justifyContent="center" class="icon-box">
            <wui-icon size="lg" color="default" name=${this.icon} class="custom-icon"></wui-icon>

            ${this.iconBadge?(0,i.dy)`<wui-icon
                  color="accent-primary"
                  size="inherit"
                  name=${this.iconBadge}
                  class="icon-badge"
                ></wui-icon>`:null}
          </wui-flex>
        </wui-flex>
      `:(0,i.dy)`
      <wui-flex flexGrow="1" alignItems="center">
        <wui-image objectFit="contain" src=${this.imageSrc} alt=${this.alt}></wui-image>
      </wui-flex>
    `}contentTemplate(){return 0===this.content.length?null:(0,i.dy)`
      <wui-flex flexDirection="column" rowgap="3">
        ${this.content.map(e=>this.labelAndTagTemplate(e))}
      </wui-flex>
    `}labelAndTagTemplate({address:e,profileName:t,label:o,description:n,enableButton:r,buttonType:a,buttonLabel:s,buttonVariant:l,tagVariant:c,tagLabel:d,alignItems:u="flex-end"}){return(0,i.dy)`
      <wui-flex justifyContent="space-between" alignItems=${u} columngap="1">
        <wui-flex flexDirection="column" rowgap="01">
          ${o?(0,i.dy)`<wui-text variant="sm-medium" color="secondary">${o}</wui-text>`:null}

          <wui-flex alignItems="center" columngap="1">
            <wui-text variant="md-regular" color="primary">
              ${b.H.getTruncateString({string:t||e,charsStart:t?16:this.charsStart,charsEnd:t?0:this.charsEnd,truncate:t?"end":"middle"})}
            </wui-text>

            ${c&&d?(0,i.dy)`<wui-tag variant=${c} size="sm">${d}</wui-tag>`:null}
          </wui-flex>

          ${n?(0,i.dy)`<wui-text variant="sm-regular" color="secondary">${n}</wui-text>`:null}
        </wui-flex>

        ${r?this.buttonTemplate({buttonType:a,buttonLabel:s,buttonVariant:l}):null}
      </wui-flex>
    `}buttonTemplate({buttonType:e,buttonLabel:t,buttonVariant:o}){return(0,i.dy)`
      <wui-button
        size="sm"
        variant=${o}
        @click=${"disconnect"===e?this.dispatchDisconnectEvent.bind(this):this.dispatchSwitchEvent.bind(this)}
        data-testid=${"disconnect"===e?"wui-active-profile-wallet-item-disconnect-button":"wui-active-profile-wallet-item-switch-button"}
      >
        ${t}
      </wui-button>
    `}dispatchDisconnectEvent(){this.dispatchEvent(new CustomEvent("disconnect",{bubbles:!0,composed:!0}))}dispatchSwitchEvent(){this.dispatchEvent(new CustomEvent("switch",{bubbles:!0,composed:!0}))}dispatchExternalLinkEvent(){this.dispatchEvent(new CustomEvent("externalLink",{bubbles:!0,composed:!0}))}dispatchMoreButtonEvent(){this.dispatchEvent(new CustomEvent("more",{bubbles:!0,composed:!0}))}dispatchCopyEvent(){this.dispatchEvent(new CustomEvent("copy",{bubbles:!0,composed:!0}))}};eJ.styles=[w.ET,w.ZM,eY],eZ([(0,n.Cb)()],eJ.prototype,"address",void 0),eZ([(0,n.Cb)()],eJ.prototype,"profileName",void 0),eZ([(0,n.Cb)({type:Array})],eJ.prototype,"content",void 0),eZ([(0,n.Cb)()],eJ.prototype,"alt",void 0),eZ([(0,n.Cb)()],eJ.prototype,"imageSrc",void 0),eZ([(0,n.Cb)()],eJ.prototype,"icon",void 0),eZ([(0,n.Cb)()],eJ.prototype,"iconSize",void 0),eZ([(0,n.Cb)()],eJ.prototype,"iconBadge",void 0),eZ([(0,n.Cb)()],eJ.prototype,"iconBadgeSize",void 0),eZ([(0,n.Cb)()],eJ.prototype,"buttonVariant",void 0),eZ([(0,n.Cb)({type:Boolean})],eJ.prototype,"enableMoreButton",void 0),eZ([(0,n.Cb)({type:Number})],eJ.prototype,"charsStart",void 0),eZ([(0,n.Cb)({type:Number})],eJ.prototype,"charsEnd",void 0),eJ=eZ([(0,m.M)("wui-active-profile-wallet-item")],eJ),o(12441);var eQ=(0,g.iv)`
  wui-image,
  .icon-box {
    width: 32px;
    height: 32px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  .right-icon {
    cursor: pointer;
  }

  .icon-box {
    position: relative;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .icon-badge {
    position: absolute;
    top: 18px;
    left: 23px;
    z-index: 3;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
    border-radius: 50%;
    padding: ${({spacing:e})=>e["01"]};
  }

  .icon-badge {
    width: 8px;
    height: 8px;
  }
`,e0=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let e3=class extends i.oi{constructor(){super(...arguments),this.address="",this.profileName="",this.alt="",this.buttonLabel="",this.buttonVariant="accent-primary",this.imageSrc="",this.icon=void 0,this.iconSize="md",this.iconBadgeSize="md",this.rightIcon="signOut",this.rightIconSize="md",this.loading=!1,this.charsStart=4,this.charsEnd=6}render(){return(0,i.dy)`
      <wui-flex alignItems="center" columngap="2">
        ${this.imageOrIconTemplate()} ${this.labelAndDescriptionTemplate()}
        ${this.buttonActionTemplate()}
      </wui-flex>
    `}imageOrIconTemplate(){return this.icon?(0,i.dy)`
        <wui-flex alignItems="center" justifyContent="center" class="icon-box">
          <wui-flex alignItems="center" justifyContent="center" class="icon-box">
            <wui-icon size="lg" color="default" name=${this.icon} class="custom-icon"></wui-icon>

            ${this.iconBadge?(0,i.dy)`<wui-icon
                  color="default"
                  size="inherit"
                  name=${this.iconBadge}
                  class="icon-badge"
                ></wui-icon>`:null}
          </wui-flex>
        </wui-flex>
      `:(0,i.dy)`<wui-image objectFit="contain" src=${this.imageSrc} alt=${this.alt}></wui-image>`}labelAndDescriptionTemplate(){return(0,i.dy)`
      <wui-flex
        flexDirection="column"
        flexGrow="1"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        <wui-text variant="lg-regular" color="primary">
          ${b.H.getTruncateString({string:this.profileName||this.address,charsStart:this.profileName?16:this.charsStart,charsEnd:this.profileName?0:this.charsEnd,truncate:this.profileName?"end":"middle"})}
        </wui-text>
      </wui-flex>
    `}buttonActionTemplate(){return(0,i.dy)`
      <wui-flex columngap="1" alignItems="center" justifyContent="center">
        <wui-button
          size="sm"
          variant=${this.buttonVariant}
          .loading=${this.loading}
          @click=${this.handleButtonClick}
          data-testid="wui-inactive-profile-wallet-item-button"
        >
          ${this.buttonLabel}
        </wui-button>

        <wui-icon-link
          variant="secondary"
          size="md"
          icon=${(0,r.o)(this.rightIcon)}
          class="right-icon"
          @click=${this.handleIconClick}
        ></wui-icon-link>
      </wui-flex>
    `}handleButtonClick(){this.dispatchEvent(new CustomEvent("buttonClick",{bubbles:!0,composed:!0}))}handleIconClick(){this.dispatchEvent(new CustomEvent("iconClick",{bubbles:!0,composed:!0}))}};e3.styles=[w.ET,w.ZM,eQ],e0([(0,n.Cb)()],e3.prototype,"address",void 0),e0([(0,n.Cb)()],e3.prototype,"profileName",void 0),e0([(0,n.Cb)()],e3.prototype,"alt",void 0),e0([(0,n.Cb)()],e3.prototype,"buttonLabel",void 0),e0([(0,n.Cb)()],e3.prototype,"buttonVariant",void 0),e0([(0,n.Cb)()],e3.prototype,"imageSrc",void 0),e0([(0,n.Cb)()],e3.prototype,"icon",void 0),e0([(0,n.Cb)()],e3.prototype,"iconSize",void 0),e0([(0,n.Cb)()],e3.prototype,"iconBadge",void 0),e0([(0,n.Cb)()],e3.prototype,"iconBadgeSize",void 0),e0([(0,n.Cb)()],e3.prototype,"rightIcon",void 0),e0([(0,n.Cb)()],e3.prototype,"rightIconSize",void 0),e0([(0,n.Cb)({type:Boolean})],e3.prototype,"loading",void 0),e0([(0,n.Cb)({type:Number})],e3.prototype,"charsStart",void 0),e0([(0,n.Cb)({type:Number})],e3.prototype,"charsEnd",void 0),e3=e0([(0,m.M)("wui-inactive-profile-wallet-item")],e3),o(69393);var e1=o(99436);let e2={getAuthData(e){let t=e.connectorId===G.b.CONNECTOR_ID.AUTH;if(!t)return{isAuth:!1,icon:void 0,iconSize:void 0,name:void 0};let o=e?.auth?.name??ea.M.getConnectedSocialProvider(),i=e?.auth?.username??ea.M.getConnectedSocialUsername(),n=X.ConnectorController.getAuthConnector(),r=n?.provider.getEmail()??"";return{isAuth:!0,icon:o??"mail",iconSize:o?"xl":"md",name:t?eN.C.getAuthName({email:r,socialUsername:i,socialProvider:o}):void 0}}};var e5=(0,p.iv)`
  :host {
    --connect-scroll--top-opacity: 0;
    --connect-scroll--bottom-opacity: 0;
  }

  .balance-amount {
    flex: 1;
  }

  .wallet-list {
    scrollbar-width: none;
    overflow-y: scroll;
    overflow-x: hidden;
    transition: opacity ${({easings:e})=>e["ease-out-power-1"]}
      ${({durations:e})=>e.md};
    will-change: opacity;
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, calc(1 - var(--connect-scroll--top-opacity))) 0px,
      rgba(200, 200, 200, calc(1 - var(--connect-scroll--top-opacity))) 1px,
      black 40px,
      black calc(100% - 40px),
      rgba(155, 155, 155, calc(1 - var(--connect-scroll--bottom-opacity))) calc(100% - 1px),
      rgba(0, 0, 0, calc(1 - var(--connect-scroll--bottom-opacity))) 100%
    );
  }

  .active-wallets {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e["4"]};
  }

  .active-wallets-box {
    height: 330px;
  }

  .empty-wallet-list-box {
    height: 400px;
  }

  .empty-box {
    width: 100%;
    padding: ${({spacing:e})=>e["4"]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e["4"]};
  }

  wui-separator {
    margin: ${({spacing:e})=>e["2"]} 0 ${({spacing:e})=>e["2"]} 0;
  }

  .active-connection {
    padding: ${({spacing:e})=>e["2"]};
  }

  .recent-connection {
    padding: ${({spacing:e})=>e["2"]} 0 ${({spacing:e})=>e["2"]} 0;
  }

  @media (max-width: 430px) {
    .active-wallets-box,
    .empty-wallet-list-box {
      height: auto;
      max-height: clamp(360px, 470px, 80vh);
    }
  }
`,e6=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let e4={ADDRESS_DISPLAY:{START:4,END:6},BADGE:{SIZE:"md",ICON:"lightbulb"},SCROLL_THRESHOLD:50,OPACITY_RANGE:[0,1]},e8={eip155:"ethereum",solana:"solana",bip122:"bitcoin"},e7=[{namespace:"eip155",icon:e8.eip155,label:"EVM"},{namespace:"solana",icon:e8.solana,label:"Solana"},{namespace:"bip122",icon:e8.bip122,label:"Bitcoin"}],e9={eip155:{title:"Add EVM Wallet",description:"Add your first EVM wallet"},solana:{title:"Add Solana Wallet",description:"Add your first Solana wallet"},bip122:{title:"Add Bitcoin Wallet",description:"Add your first Bitcoin wallet"}},te=class extends i.oi{constructor(){super(),this.unsubscribers=[],this.currentTab=0,this.namespace=s.R.state.activeChain,this.namespaces=Array.from(s.R.state.chains.keys()),this.caipAddress=void 0,this.profileName=void 0,this.activeConnectorIds=X.ConnectorController.state.activeConnectorIds,this.lastSelectedAddress="",this.lastSelectedConnectorId="",this.isSwitching=!1,this.caipNetwork=s.R.state.activeCaipNetwork,this.user=d.AccountController.state.user,this.remoteFeatures=a.OptionsController.state.remoteFeatures,this.currentTab=this.namespace?this.namespaces.indexOf(this.namespace):0,this.caipAddress=s.R.getAccountData(this.namespace)?.caipAddress,this.profileName=s.R.getAccountData(this.namespace)?.profileName,this.unsubscribers.push(ee.ConnectionController.subscribeKey("connections",()=>this.onConnectionsChange()),ee.ConnectionController.subscribeKey("recentConnections",()=>this.requestUpdate()),X.ConnectorController.subscribeKey("activeConnectorIds",e=>{this.activeConnectorIds=e}),s.R.subscribeKey("activeCaipNetwork",e=>this.caipNetwork=e),d.AccountController.subscribeKey("user",e=>this.user=e),a.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e)),this.chainListener=s.R.subscribeChainProp("accountState",e=>{this.caipAddress=e?.caipAddress,this.profileName=e?.profileName},this.namespace)}disconnectedCallback(){this.unsubscribers.forEach(e=>e()),this.resizeObserver?.disconnect(),this.removeScrollListener(),this.chainListener?.()}firstUpdated(){let e=this.shadowRoot?.querySelector(".wallet-list");if(!e)return;let t=()=>this.updateScrollOpacity(e);requestAnimationFrame(t),e.addEventListener("scroll",t),this.resizeObserver=new ResizeObserver(t),this.resizeObserver.observe(e),t()}render(){let e=this.namespace;if(!e)throw Error("Namespace is not set");return(0,i.dy)`
      <wui-flex flexDirection="column" .padding=${["0","4","4","4"]} gap="4">
        ${this.renderTabs()} ${this.renderHeader(e)} ${this.renderConnections(e)}
        ${this.renderAddConnectionButton(e)}
      </wui-flex>
    `}renderTabs(){let e=e7.filter(e=>this.namespaces.includes(e.namespace));return e.length>1?(0,i.dy)`
        <wui-tabs
          .onTabChange=${e=>this.handleTabChange(e)}
          .activeTab=${this.currentTab}
          .tabs=${e}
        ></wui-tabs>
      `:null}renderHeader(e){let t=this.getActiveConnections(e).flatMap(({accounts:e})=>e).length+(this.caipAddress?1:0);return(0,i.dy)`
      <wui-flex alignItems="center" columngap="1">
        <wui-icon
          size="sm"
          name=${e8[e]??e8.eip155}
        ></wui-icon>
        <wui-text color="secondary" variant="lg-regular"
          >${t>1?"Wallets":"Wallet"}</wui-text
        >
        <wui-text
          color="primary"
          variant="lg-regular"
          class="balance-amount"
          data-testid="balance-amount"
        >
          ${t}
        </wui-text>
        <wui-link
          color="secondary"
          variant="secondary"
          @click=${()=>ee.ConnectionController.disconnect({namespace:e})}
          ?disabled=${!this.hasAnyConnections(e)}
          data-testid="disconnect-all-button"
        >
          Disconnect All
        </wui-link>
      </wui-flex>
    `}renderConnections(e){let t=this.hasAnyConnections(e);return(0,i.dy)`
      <wui-flex flexDirection="column" class=${(0,eq.$)({"wallet-list":!0,"active-wallets-box":t,"empty-wallet-list-box":!t})} rowgap="3">
        ${t?this.renderActiveConnections(e):this.renderEmptyState(e)}
      </wui-flex>
    `}renderActiveConnections(e){let t=this.getActiveConnections(e),o=this.activeConnectorIds[e],n=this.getPlainAddress();return(0,i.dy)`
      ${n||o||t.length>0?(0,i.dy)`<wui-flex
            flexDirection="column"
            .padding=${["4","0","4","0"]}
            class="active-wallets"
          >
            ${this.renderActiveProfile(e)} ${this.renderActiveConnectionsList(e)}
          </wui-flex>`:null}
      ${this.renderRecentConnections(e)}
    `}renderActiveProfile(e){let t=this.activeConnectorIds[e];if(!t)return null;let{connections:o}=eX.f.getConnectionsData(e),n=X.ConnectorController.getConnectorById(t),r=c.f.getConnectorImage(n),a=this.getPlainAddress();if(!a)return null;let s=e===G.b.CHAIN.BITCOIN,l=e2.getAuthData({connectorId:t,accounts:[]}),d=this.getActiveConnections(e).flatMap(e=>e.accounts).length>0,u=o.find(e=>e.connectorId===t),h=u?.accounts.filter(e=>!e1.g.isLowerCaseMatch(e.address,a));return(0,i.dy)`
      <wui-flex flexDirection="column" .padding=${["0","4","0","4"]}>
        <wui-active-profile-wallet-item
          address=${a}
          alt=${n?.name}
          .content=${this.getProfileContent({address:a,connections:o,connectorId:t,namespace:e})}
          .charsStart=${e4.ADDRESS_DISPLAY.START}
          .charsEnd=${e4.ADDRESS_DISPLAY.END}
          .icon=${l.icon}
          .iconSize=${l.iconSize}
          .iconBadge=${this.isSmartAccount(a)?e4.BADGE.ICON:void 0}
          .iconBadgeSize=${this.isSmartAccount(a)?e4.BADGE.SIZE:void 0}
          imageSrc=${r}
          ?enableMoreButton=${l.isAuth}
          @copy=${()=>this.handleCopyAddress(a)}
          @disconnect=${()=>this.handleDisconnect(e,t)}
          @switch=${()=>{s&&u&&h?.[0]&&this.handleSwitchWallet(u,h[0].address,e)}}
          @externalLink=${()=>this.handleExternalLink(a)}
          @more=${()=>this.handleMore()}
          data-testid="wui-active-profile-wallet-item"
        ></wui-active-profile-wallet-item>
        ${d?(0,i.dy)`<wui-separator></wui-separator>`:null}
      </wui-flex>
    `}renderActiveConnectionsList(e){let t=this.getActiveConnections(e);return 0===t.length?null:(0,i.dy)`
      <wui-flex flexDirection="column" .padding=${["0","2","0","2"]}>
        ${this.renderConnectionList(t,!1,e)}
      </wui-flex>
    `}renderRecentConnections(e){let{recentConnections:t}=eX.f.getConnectionsData(e);return 0===t.flatMap(e=>e.accounts).length?null:(0,i.dy)`
      <wui-flex flexDirection="column" .padding=${["0","2","0","2"]} rowGap="2">
        <wui-text color="secondary" variant="sm-medium" data-testid="recently-connected-text"
          >RECENTLY CONNECTED</wui-text
        >
        <wui-flex flexDirection="column" .padding=${["0","2","0","2"]}>
          ${this.renderConnectionList(t,!0,e)}
        </wui-flex>
      </wui-flex>
    `}renderConnectionList(e,t,o){return e.filter(e=>e.accounts.length>0).map((e,n)=>{let r=X.ConnectorController.getConnectorById(e.connectorId),a=c.f.getConnectorImage(r)??"",s=e2.getAuthData(e);return e.accounts.map((r,l)=>{let c=this.isAccountLoading(e.connectorId,r.address);return(0,i.dy)`
            <wui-flex flexDirection="column">
              ${0!==n||0!==l?(0,i.dy)`<wui-separator></wui-separator>`:null}
              <wui-inactive-profile-wallet-item
                address=${r.address}
                alt=${e.connectorId}
                buttonLabel=${t?"Connect":"Switch"}
                buttonVariant=${t?"neutral-secondary":"accent-secondary"}
                rightIcon=${t?"bin":"power"}
                rightIconSize="sm"
                class=${t?"recent-connection":"active-connection"}
                data-testid=${t?"recent-connection":"active-connection"}
                imageSrc=${a}
                .iconBadge=${this.isSmartAccount(r.address)?e4.BADGE.ICON:void 0}
                .iconBadgeSize=${this.isSmartAccount(r.address)?e4.BADGE.SIZE:void 0}
                .icon=${s.icon}
                .iconSize=${s.iconSize}
                .loading=${c}
                .showBalance=${!1}
                .charsStart=${e4.ADDRESS_DISPLAY.START}
                .charsEnd=${e4.ADDRESS_DISPLAY.END}
                @buttonClick=${()=>this.handleSwitchWallet(e,r.address,o)}
                @iconClick=${()=>this.handleWalletAction({connection:e,address:r.address,isRecentConnection:t,namespace:o})}
              ></wui-inactive-profile-wallet-item>
            </wui-flex>
          `})})}renderAddConnectionButton(e){if(!this.isMultiWalletEnabled()&&this.caipAddress||!this.hasAnyConnections(e))return null;let{title:t}=this.getChainLabelInfo(e);return(0,i.dy)`
      <wui-list-item
        variant="icon"
        iconVariant="overlay"
        icon="plus"
        iconSize="sm"
        ?chevron=${!0}
        @click=${()=>this.handleAddConnection(e)}
        data-testid="add-connection-button"
      >
        <wui-text variant="md-medium" color="secondary">${t}</wui-text>
      </wui-list-item>
    `}renderEmptyState(e){let{title:t,description:o}=this.getChainLabelInfo(e);return(0,i.dy)`
      <wui-flex alignItems="flex-start" class="empty-template" data-testid="empty-template">
        <wui-flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          rowgap="3"
          class="empty-box"
        >
          <wui-icon-box size="xl" icon="wallet" color="secondary"></wui-icon-box>

          <wui-flex flexDirection="column" alignItems="center" justifyContent="center" gap="1">
            <wui-text color="primary" variant="lg-regular" data-testid="empty-state-text"
              >No wallet connected</wui-text
            >
            <wui-text color="secondary" variant="md-regular" data-testid="empty-state-description"
              >${o}</wui-text
            >
          </wui-flex>

          <wui-link
            @click=${()=>this.handleAddConnection(e)}
            data-testid="empty-state-button"
            icon="plus"
          >
            ${t}
          </wui-link>
        </wui-flex>
      </wui-flex>
    `}handleTabChange(e){let t=this.namespaces[e];t&&(this.chainListener?.(),this.currentTab=this.namespaces.indexOf(t),this.namespace=t,this.caipAddress=s.R.getAccountData(t)?.caipAddress,this.profileName=s.R.getAccountData(t)?.profileName,this.chainListener=s.R.subscribeChainProp("accountState",e=>{this.caipAddress=e?.caipAddress},t))}async handleSwitchWallet(e,t,o){try{this.isSwitching=!0,this.lastSelectedConnectorId=e.connectorId,this.lastSelectedAddress=t,await ee.ConnectionController.switchConnection({connection:e,address:t,namespace:o,closeModalOnConnect:!1,onChange({hasSwitchedAccount:e,hasSwitchedWallet:t}){t?Z.SnackController.showSuccess("Wallet switched"):e&&Z.SnackController.showSuccess("Account switched")}})}catch(e){Z.SnackController.showError("Failed to switch wallet")}finally{this.isSwitching=!1}}handleWalletAction(e){let{connection:t,address:o,isRecentConnection:i,namespace:n}=e;i?(ea.M.deleteAddressFromConnection({connectorId:t.connectorId,address:o,namespace:n}),ee.ConnectionController.syncStorageConnections(),Z.SnackController.showSuccess("Wallet deleted")):this.handleDisconnect(n,t.connectorId)}async handleDisconnect(e,t){try{await ee.ConnectionController.disconnectConnector({id:t,namespace:e}),Z.SnackController.showSuccess("Wallet disconnected")}catch{Z.SnackController.showError("Failed to disconnect wallet")}}handleCopyAddress(e){u.j.copyToClopboard(e),Z.SnackController.showSuccess("Address copied")}handleMore(){Q.RouterController.push("AccountSettings")}handleExternalLink(e){let t=this.caipNetwork?.blockExplorers?.default.url;t&&u.j.openHref(`${t}/address/${e}`,"_blank")}handleAddConnection(e){X.ConnectorController.setFilterByNamespace(e),Q.RouterController.push("Connect",{addWalletForNamespace:e})}getChainLabelInfo(e){return e9[e]??{title:"Add Wallet",description:"Add your first wallet"}}isSmartAccount(e){if(!this.namespace)return!1;let t=this.user?.accounts?.find(e=>"smartAccount"===e.type);return!!t&&!!e&&e1.g.isLowerCaseMatch(t.address,e)}getPlainAddress(){return this.caipAddress?u.j.getPlainAddress(this.caipAddress):void 0}getActiveConnections(e){let t=this.activeConnectorIds[e],{connections:o}=eX.f.getConnectionsData(e),[i]=o.filter(e=>e1.g.isLowerCaseMatch(e.connectorId,t));if(!t)return o;let n=e===G.b.CHAIN.BITCOIN,{address:r}=this.caipAddress?eG.u.parseCaipAddress(this.caipAddress):{},a=[...r?[r]:[]];return n&&i&&(a=i.accounts.map(e=>e.address)||[]),eX.f.excludeConnectorAddressFromConnections({connectorId:t,addresses:a,connections:o})}hasAnyConnections(e){let t=this.getActiveConnections(e),{recentConnections:o}=eX.f.getConnectionsData(e);return!!this.caipAddress||t.length>0||o.length>0}isAccountLoading(e,t){return e1.g.isLowerCaseMatch(this.lastSelectedConnectorId,e)&&e1.g.isLowerCaseMatch(this.lastSelectedAddress,t)&&this.isSwitching}getProfileContent(e){let{address:t,connections:o,connectorId:i,namespace:n}=e,[r]=o.filter(e=>e1.g.isLowerCaseMatch(e.connectorId,i));if(n===G.b.CHAIN.BITCOIN&&r?.accounts.every(e=>"string"==typeof e.type))return this.getBitcoinProfileContent(r.accounts,t);let a=e2.getAuthData({connectorId:i,accounts:[]});return[{address:t,tagLabel:"Active",tagVariant:"success",enableButton:!0,profileName:this.profileName,buttonType:"disconnect",buttonLabel:"Disconnect",buttonVariant:"neutral-secondary",...a.isAuth?{description:this.isSmartAccount(t)?"Smart Account":"EOA Account"}:{}}]}getBitcoinProfileContent(e,t){let o=e.length>1,i=this.getPlainAddress();return e.map(e=>{let n=e1.g.isLowerCaseMatch(e.address,i),r="PAYMENT";return"ordinal"===e.type&&(r="ORDINALS"),{address:e.address,tagLabel:e1.g.isLowerCaseMatch(e.address,t)?"Active":void 0,tagVariant:e1.g.isLowerCaseMatch(e.address,t)?"success":void 0,enableButton:!0,...o?{label:r,alignItems:"flex-end",buttonType:n?"disconnect":"switch",buttonLabel:n?"Disconnect":"Switch",buttonVariant:n?"neutral-secondary":"accent-secondary"}:{alignItems:"center",buttonType:"disconnect",buttonLabel:"Disconnect",buttonVariant:"neutral-secondary"}}})}removeScrollListener(){let e=this.shadowRoot?.querySelector(".wallet-list");e&&e.removeEventListener("scroll",()=>this.handleConnectListScroll())}handleConnectListScroll(){let e=this.shadowRoot?.querySelector(".wallet-list");e&&this.updateScrollOpacity(e)}isMultiWalletEnabled(){return!!this.remoteFeatures?.multiWallet}updateScrollOpacity(e){e.style.setProperty("--connect-scroll--top-opacity",p.kj.interpolate([0,e4.SCROLL_THRESHOLD],e4.OPACITY_RANGE,e.scrollTop).toString()),e.style.setProperty("--connect-scroll--bottom-opacity",p.kj.interpolate([0,e4.SCROLL_THRESHOLD],e4.OPACITY_RANGE,e.scrollHeight-e.scrollTop-e.offsetHeight).toString())}onConnectionsChange(){if(this.isMultiWalletEnabled()&&this.namespace){let{connections:e}=eX.f.getConnectionsData(this.namespace);0===e.length&&Q.RouterController.reset("ProfileWallets")}this.requestUpdate()}};te.styles=e5,e6([(0,n.SB)()],te.prototype,"currentTab",void 0),e6([(0,n.SB)()],te.prototype,"namespace",void 0),e6([(0,n.SB)()],te.prototype,"namespaces",void 0),e6([(0,n.SB)()],te.prototype,"caipAddress",void 0),e6([(0,n.SB)()],te.prototype,"profileName",void 0),e6([(0,n.SB)()],te.prototype,"activeConnectorIds",void 0),e6([(0,n.SB)()],te.prototype,"lastSelectedAddress",void 0),e6([(0,n.SB)()],te.prototype,"lastSelectedConnectorId",void 0),e6([(0,n.SB)()],te.prototype,"isSwitching",void 0),e6([(0,n.SB)()],te.prototype,"caipNetwork",void 0),e6([(0,n.SB)()],te.prototype,"user",void 0),e6([(0,n.SB)()],te.prototype,"remoteFeatures",void 0),te=e6([(0,p.Mo)("w3m-profile-wallets-view")],te);var tt=o(30183),to=(0,g.iv)`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  label {
    position: relative;
    display: inline-block;
    user-select: none;
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      color ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      border ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      width ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      height ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color, color, border, box-shadow, width, height, transform, opacity;
  }

  input {
    width: 0;
    height: 0;
    opacity: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({colors:e})=>e.neutrals300};
    border-radius: ${({borderRadius:e})=>e.round};
    border: 1px solid transparent;
    will-change: border;
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      color ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      border ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      width ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      height ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color, color, border, box-shadow, width, height, transform, opacity;
  }

  span:before {
    content: '';
    position: absolute;
    background-color: ${({colors:e})=>e.white};
    border-radius: 50%;
  }

  /* -- Sizes --------------------------------------------------------- */
  label[data-size='lg'] {
    width: 48px;
    height: 32px;
  }

  label[data-size='md'] {
    width: 40px;
    height: 28px;
  }

  label[data-size='sm'] {
    width: 32px;
    height: 22px;
  }

  label[data-size='lg'] > span:before {
    height: 24px;
    width: 24px;
    left: 4px;
    top: 3px;
  }

  label[data-size='md'] > span:before {
    height: 20px;
    width: 20px;
    left: 4px;
    top: 3px;
  }

  label[data-size='sm'] > span:before {
    height: 16px;
    width: 16px;
    left: 3px;
    top: 2px;
  }

  /* -- Focus states --------------------------------------------------- */
  input:focus-visible:not(:checked) + span,
  input:focus:not(:checked) + span {
    border: 1px solid ${({tokens:e})=>e.core.iconAccentPrimary};
    background-color: ${({tokens:e})=>e.theme.textTertiary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  input:focus-visible:checked + span,
  input:focus:checked + span {
    border: 1px solid ${({tokens:e})=>e.core.iconAccentPrimary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  /* -- Checked states --------------------------------------------------- */
  input:checked + span {
    background-color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  label[data-size='lg'] > input:checked + span:before {
    transform: translateX(calc(100% - 9px));
  }

  label[data-size='md'] > input:checked + span:before {
    transform: translateX(calc(100% - 9px));
  }

  label[data-size='sm'] > input:checked + span:before {
    transform: translateX(calc(100% - 7px));
  }

  /* -- Hover states ------------------------------------------------------- */
  label:hover > input:not(:checked):not(:disabled) + span {
    background-color: ${({colors:e})=>e.neutrals400};
  }

  label:hover > input:checked:not(:disabled) + span {
    background-color: ${({colors:e})=>e.accent080};
  }

  /* -- Disabled state --------------------------------------------------- */
  label:has(input:disabled) {
    pointer-events: none;
    user-select: none;
  }

  input:not(:checked):disabled + span {
    background-color: ${({colors:e})=>e.neutrals700};
  }

  input:checked:disabled + span {
    background-color: ${({colors:e})=>e.neutrals700};
  }

  input:not(:checked):disabled + span::before {
    background-color: ${({colors:e})=>e.neutrals400};
  }

  input:checked:disabled + span::before {
    background-color: ${({tokens:e})=>e.theme.textTertiary};
  }
`,ti=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let tn=class extends i.oi{constructor(){super(...arguments),this.inputElementRef=(0,tt.V)(),this.checked=!1,this.disabled=!1,this.size="md"}render(){return(0,i.dy)`
      <label data-size=${this.size}>
        <input
          ${(0,tt.i)(this.inputElementRef)}
          type="checkbox"
          ?checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this.dispatchChangeEvent.bind(this)}
        />
        <span></span>
      </label>
    `}dispatchChangeEvent(){this.dispatchEvent(new CustomEvent("switchChange",{detail:this.inputElementRef.value?.checked,bubbles:!0,composed:!0}))}};tn.styles=[w.ET,w.ZM,to],ti([(0,n.Cb)({type:Boolean})],tn.prototype,"checked",void 0),ti([(0,n.Cb)({type:Boolean})],tn.prototype,"disabled",void 0),ti([(0,n.Cb)()],tn.prototype,"size",void 0),tn=ti([(0,m.M)("wui-toggle")],tn);var tr=(0,g.iv)`
  :host {
    height: auto;
  }

  :host > wui-flex {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: ${({spacing:e})=>e["2"]};
    padding: ${({spacing:e})=>e["2"]} ${({spacing:e})=>e["3"]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e["4"]};
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
    cursor: pointer;
  }

  wui-switch {
    pointer-events: none;
  }
`,ta=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let ts=class extends i.oi{constructor(){super(...arguments),this.checked=!1}render(){return(0,i.dy)`
      <wui-flex>
        <wui-icon size="xl" name="walletConnectBrown"></wui-icon>
        <wui-toggle
          ?checked=${this.checked}
          size="sm"
          @switchChange=${this.handleToggleChange.bind(this)}
        ></wui-toggle>
      </wui-flex>
    `}handleToggleChange(e){e.stopPropagation(),this.checked=e.detail,this.dispatchSwitchEvent()}dispatchSwitchEvent(){this.dispatchEvent(new CustomEvent("certifiedSwitchChange",{detail:this.checked,bubbles:!0,composed:!0}))}};ts.styles=[w.ET,w.ZM,tr],ta([(0,n.Cb)({type:Boolean})],ts.prototype,"checked",void 0),ts=ta([(0,m.M)("wui-certified-switch")],ts),o(72785);var tl=(0,g.iv)`
  :host {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  wui-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:e})=>e[3]};
    color: ${({tokens:e})=>e.theme.iconDefault};
    cursor: pointer;
    padding: ${({spacing:e})=>e[2]};
    background-color: transparent;
    border-radius: ${({borderRadius:e})=>e[4]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
  }

  @media (hover: hover) {
    wui-icon:hover {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }
`,tc=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let td=class extends i.oi{constructor(){super(...arguments),this.inputComponentRef=(0,tt.V)(),this.inputValue=""}render(){return(0,i.dy)`
      <wui-input-text
        ${(0,tt.i)(this.inputComponentRef)}
        placeholder="Search wallet"
        icon="search"
        type="search"
        enterKeyHint="search"
        size="sm"
        @inputChange=${this.onInputChange}
      >
        ${this.inputValue?(0,i.dy)`<wui-icon
              @click=${this.clearValue}
              color="inherit"
              size="sm"
              name="close"
            ></wui-icon>`:null}
      </wui-input-text>
    `}onInputChange(e){this.inputValue=e.detail||""}clearValue(){let e=this.inputComponentRef.value,t=e?.inputElementRef.value;t&&(t.value="",this.inputValue="",t.focus(),t.dispatchEvent(new Event("input")))}};td.styles=[w.ET,tl],tc([(0,n.Cb)()],td.prototype,"inputValue",void 0),td=tc([(0,m.M)("wui-search-bar")],td);var tu=o(48113),th=o(16965);o(22584);var tp=(0,g.iv)`
  :host {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 104px;
    width: 104px;
    row-gap: ${({spacing:e})=>e[2]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[5]};
    position: relative;
  }

  wui-shimmer[data-type='network'] {
    border: none;
    -webkit-clip-path: var(--apkt-path-network);
    clip-path: var(--apkt-path-network);
  }

  svg {
    position: absolute;
    width: 48px;
    height: 54px;
    z-index: 1;
  }

  svg > path {
    stroke: ${({tokens:e})=>e.theme.foregroundSecondary};
    stroke-width: 1px;
  }

  @media (max-width: 350px) {
    :host {
      width: 100%;
    }
  }
`,tw=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let tb=class extends i.oi{constructor(){super(...arguments),this.type="wallet"}render(){return(0,i.dy)`
      ${this.shimmerTemplate()}
      <wui-shimmer width="80px" height="20px"></wui-shimmer>
    `}shimmerTemplate(){return"network"===this.type?(0,i.dy)` <wui-shimmer data-type=${this.type} width="48px" height="54px"></wui-shimmer>
        ${th.W}`:(0,i.dy)`<wui-shimmer width="56px" height="56px"></wui-shimmer>`}};tb.styles=[w.ET,w.ZM,tp],tw([(0,n.Cb)()],tb.prototype,"type",void 0),tb=tw([(0,m.M)("wui-card-select-loader")],tb);var tm=(0,i.iv)`
  :host {
    display: grid;
    width: inherit;
    height: inherit;
  }
`,tg=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let tf=class extends i.oi{render(){return this.style.cssText=`
      grid-template-rows: ${this.gridTemplateRows};
      grid-template-columns: ${this.gridTemplateColumns};
      justify-items: ${this.justifyItems};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      align-content: ${this.alignContent};
      column-gap: ${this.columnGap&&`var(--apkt-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap&&`var(--apkt-spacing-${this.rowGap})`};
      gap: ${this.gap&&`var(--apkt-spacing-${this.gap})`};
      padding-top: ${this.padding&&b.H.getSpacingStyles(this.padding,0)};
      padding-right: ${this.padding&&b.H.getSpacingStyles(this.padding,1)};
      padding-bottom: ${this.padding&&b.H.getSpacingStyles(this.padding,2)};
      padding-left: ${this.padding&&b.H.getSpacingStyles(this.padding,3)};
      margin-top: ${this.margin&&b.H.getSpacingStyles(this.margin,0)};
      margin-right: ${this.margin&&b.H.getSpacingStyles(this.margin,1)};
      margin-bottom: ${this.margin&&b.H.getSpacingStyles(this.margin,2)};
      margin-left: ${this.margin&&b.H.getSpacingStyles(this.margin,3)};
    `,(0,i.dy)`<slot></slot>`}};tf.styles=[w.ET,tm],tg([(0,n.Cb)()],tf.prototype,"gridTemplateRows",void 0),tg([(0,n.Cb)()],tf.prototype,"gridTemplateColumns",void 0),tg([(0,n.Cb)()],tf.prototype,"justifyItems",void 0),tg([(0,n.Cb)()],tf.prototype,"alignItems",void 0),tg([(0,n.Cb)()],tf.prototype,"justifyContent",void 0),tg([(0,n.Cb)()],tf.prototype,"alignContent",void 0),tg([(0,n.Cb)()],tf.prototype,"columnGap",void 0),tg([(0,n.Cb)()],tf.prototype,"rowGap",void 0),tg([(0,n.Cb)()],tf.prototype,"gap",void 0),tg([(0,n.Cb)()],tf.prototype,"padding",void 0),tg([(0,n.Cb)()],tf.prototype,"margin",void 0),tf=tg([(0,m.M)("wui-grid")],tf);var ty=o(32786);o(91833),o(73783);var tC=(0,p.iv)`
  button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    width: 104px;
    row-gap: ${({spacing:e})=>e["2"]};
    padding: ${({spacing:e})=>e["3"]} ${({spacing:e})=>e["0"]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: clamp(0px, ${({borderRadius:e})=>e["4"]}, 20px);
    transition:
      color ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-1"]},
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]},
      border-radius ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]};
    will-change: background-color, color, border-radius;
    outline: none;
    border: none;
  }

  button > wui-flex > wui-text {
    color: ${({tokens:e})=>e.theme.textPrimary};
    max-width: 86px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: center;
  }

  button > wui-flex > wui-text.certified {
    max-width: 66px;
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  button:disabled > wui-flex > wui-text {
    color: ${({tokens:e})=>e.core.glass010};
  }

  [data-selected='true'] {
    background-color: ${({colors:e})=>e.accent020};
  }

  @media (hover: hover) and (pointer: fine) {
    [data-selected='true']:hover:enabled {
      background-color: ${({colors:e})=>e.accent010};
    }
  }

  [data-selected='true']:active:enabled {
    background-color: ${({colors:e})=>e.accent010};
  }

  @media (max-width: 350px) {
    button {
      width: 100%;
    }
  }
`,tv=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let tx=class extends i.oi{constructor(){super(),this.observer=new IntersectionObserver(()=>void 0),this.visible=!1,this.imageSrc=void 0,this.imageLoading=!1,this.isImpressed=!1,this.explorerId="",this.walletQuery="",this.certified=!1,this.wallet=void 0,this.observer=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting?(this.visible=!0,this.fetchImageSrc(),this.sendImpressionEvent()):this.visible=!1})},{threshold:.01})}firstUpdated(){this.observer.observe(this)}disconnectedCallback(){this.observer.disconnect()}render(){let e=this.wallet?.badge_type==="certified";return(0,i.dy)`
      <button>
        ${this.imageTemplate()}
        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" gap="1">
          <wui-text
            variant="md-regular"
            color="inherit"
            class=${(0,r.o)(e?"certified":void 0)}
            >${this.wallet?.name}</wui-text
          >
          ${e?(0,i.dy)`<wui-icon size="sm" name="walletConnectBrown"></wui-icon>`:null}
        </wui-flex>
      </button>
    `}imageTemplate(){return(this.visible||this.imageSrc)&&!this.imageLoading?(0,i.dy)`
      <wui-wallet-image
        size="lg"
        imageSrc=${(0,r.o)(this.imageSrc)}
        name=${(0,r.o)(this.wallet?.name)}
        .installed=${this.wallet?.installed??!1}
        badgeSize="sm"
      >
      </wui-wallet-image>
    `:this.shimmerTemplate()}shimmerTemplate(){return(0,i.dy)`<wui-shimmer width="56px" height="56px"></wui-shimmer>`}async fetchImageSrc(){this.wallet&&(this.imageSrc=c.f.getWalletImage(this.wallet),this.imageSrc||(this.imageLoading=!0,this.imageSrc=await c.f.fetchWalletImage(this.wallet.image_id),this.imageLoading=!1))}sendImpressionEvent(){this.wallet&&!this.isImpressed&&(this.isImpressed=!0,W.X.sendEvent({type:"track",event:"WALLET_IMPRESSION",properties:{name:this.wallet.name,walletRank:this.wallet.order,explorerId:this.explorerId,view:Q.RouterController.state.view,query:this.walletQuery,certified:this.certified}}))}};tx.styles=tC,tv([(0,n.SB)()],tx.prototype,"visible",void 0),tv([(0,n.SB)()],tx.prototype,"imageSrc",void 0),tv([(0,n.SB)()],tx.prototype,"imageLoading",void 0),tv([(0,n.SB)()],tx.prototype,"isImpressed",void 0),tv([(0,n.Cb)()],tx.prototype,"explorerId",void 0),tv([(0,n.Cb)()],tx.prototype,"walletQuery",void 0),tv([(0,n.Cb)()],tx.prototype,"certified",void 0),tv([(0,n.Cb)({type:Object})],tx.prototype,"wallet",void 0),tx=tv([(0,p.Mo)("w3m-all-wallets-list-item")],tx);var t$=(0,p.iv)`
  wui-grid {
    max-height: clamp(360px, 400px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  w3m-all-wallets-list-item {
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e["ease-inout-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  wui-loading-spinner {
    padding-top: ${({spacing:e})=>e["4"]};
    padding-bottom: ${({spacing:e})=>e["4"]};
    justify-content: center;
    grid-column: 1 / span 4;
  }
`,tk=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let tS="local-paginator",tR=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.paginationObserver=void 0,this.loading=!tu.ApiController.state.wallets.length,this.wallets=tu.ApiController.state.wallets,this.recommended=tu.ApiController.state.recommended,this.featured=tu.ApiController.state.featured,this.filteredWallets=tu.ApiController.state.filteredWallets,this.unsubscribe.push(tu.ApiController.subscribeKey("wallets",e=>this.wallets=e),tu.ApiController.subscribeKey("recommended",e=>this.recommended=e),tu.ApiController.subscribeKey("featured",e=>this.featured=e),tu.ApiController.subscribeKey("filteredWallets",e=>this.filteredWallets=e))}firstUpdated(){this.initialFetch(),this.createPaginationObserver()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.paginationObserver?.disconnect()}render(){return(0,i.dy)`
      <wui-grid
        data-scroll=${!this.loading}
        .padding=${["0","3","3","3"]}
        gap="2"
        justifyContent="space-between"
      >
        ${this.loading?this.shimmerTemplate(16):this.walletsTemplate()}
        ${this.paginationLoaderTemplate()}
      </wui-grid>
    `}async initialFetch(){this.loading=!0;let e=this.shadowRoot?.querySelector("wui-grid");e&&(await tu.ApiController.fetchWalletsByPage({page:1}),await e.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.loading=!1,e.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}shimmerTemplate(e,t){return[...Array(e)].map(()=>(0,i.dy)`
        <wui-card-select-loader type="wallet" id=${(0,r.o)(t)}></wui-card-select-loader>
      `)}getWallets(){let e=[...this.featured,...this.recommended];this.filteredWallets?.length>0?e.push(...this.filteredWallets):e.push(...this.wallets);let t=u.j.uniqueBy(e,"id"),o=ty.J.markWalletsAsInstalled(t);return ty.J.markWalletsWithDisplayIndex(o)}walletsTemplate(){return this.getWallets().map(e=>(0,i.dy)`
        <w3m-all-wallets-list-item
          data-testid="wallet-search-item-${e.id}"
          @click=${()=>this.onConnectWallet(e)}
          .wallet=${e}
          explorerId=${e.id}
          certified=${"certified"===this.badge}
        ></w3m-all-wallets-list-item>
      `)}paginationLoaderTemplate(){let{wallets:e,recommended:t,featured:o,count:i,mobileFilteredOutWalletsLength:n}=tu.ApiController.state,r=window.innerWidth<352?3:4,a=e.length+t.length,s=Math.ceil(a/r)*r-a+r;return(s-=e.length?o.length%r:0,0===i&&o.length>0)?null:0===i||[...o,...e,...t].length<i-(n??0)?this.shimmerTemplate(s,tS):null}createPaginationObserver(){let e=this.shadowRoot?.querySelector(`#${tS}`);e&&(this.paginationObserver=new IntersectionObserver(([e])=>{if(e?.isIntersecting&&!this.loading){let{page:e,count:t,wallets:o}=tu.ApiController.state;o.length<t&&tu.ApiController.fetchWalletsByPage({page:e+1})}}),this.paginationObserver.observe(e))}onConnectWallet(e){X.ConnectorController.selectWalletConnector(e)}};tR.styles=t$,tk([(0,n.SB)()],tR.prototype,"loading",void 0),tk([(0,n.SB)()],tR.prototype,"wallets",void 0),tk([(0,n.SB)()],tR.prototype,"recommended",void 0),tk([(0,n.SB)()],tR.prototype,"featured",void 0),tk([(0,n.SB)()],tR.prototype,"filteredWallets",void 0),tk([(0,n.SB)()],tR.prototype,"badge",void 0),tR=tk([(0,p.Mo)("w3m-all-wallets-list")],tR),o(73049);var tE=(0,i.iv)`
  wui-grid,
  wui-loading-spinner,
  wui-flex {
    height: 360px;
  }

  wui-grid {
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-loading-spinner {
    justify-content: center;
    align-items: center;
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`,tA=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let tI=class extends i.oi{constructor(){super(...arguments),this.prevQuery="",this.prevBadge=void 0,this.loading=!0,this.query=""}render(){return this.onSearch(),this.loading?(0,i.dy)`<wui-loading-spinner color="accent-primary"></wui-loading-spinner>`:this.walletsTemplate()}async onSearch(){(this.query.trim()!==this.prevQuery.trim()||this.badge!==this.prevBadge)&&(this.prevQuery=this.query,this.prevBadge=this.badge,this.loading=!0,await tu.ApiController.searchWallet({search:this.query,badge:this.badge}),this.loading=!1)}walletsTemplate(){let{search:e}=tu.ApiController.state,t=ty.J.markWalletsAsInstalled(e);return e.length?(0,i.dy)`
      <wui-grid
        data-testid="wallet-list"
        .padding=${["0","3","3","3"]}
        rowGap="4"
        columngap="2"
        justifyContent="space-between"
      >
        ${t.map(e=>(0,i.dy)`
            <w3m-all-wallets-list-item
              @click=${()=>this.onConnectWallet(e)}
              .wallet=${e}
              data-testid="wallet-search-item-${e.id}"
              explorerId=${e.id}
              certified=${"certified"===this.badge}
              walletQuery=${this.query}
            ></w3m-all-wallets-list-item>
          `)}
      </wui-grid>
    `:(0,i.dy)`
        <wui-flex
          data-testid="no-wallet-found"
          justifyContent="center"
          alignItems="center"
          gap="3"
          flexDirection="column"
        >
          <wui-icon-box size="lg" color="default" icon="wallet"></wui-icon-box>
          <wui-text data-testid="no-wallet-found-text" color="secondary" variant="md-medium">
            No Wallet found
          </wui-text>
        </wui-flex>
      `}onConnectWallet(e){X.ConnectorController.selectWalletConnector(e)}};tI.styles=tE,tA([(0,n.SB)()],tI.prototype,"loading",void 0),tA([(0,n.Cb)()],tI.prototype,"query",void 0),tA([(0,n.Cb)()],tI.prototype,"badge",void 0),tI=tA([(0,p.Mo)("w3m-all-wallets-search")],tI);var tT=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let tO=class extends i.oi{constructor(){super(...arguments),this.search="",this.badge=void 0,this.onDebouncedSearch=u.j.debounce(e=>{this.search=e})}render(){let e=this.search.length>=2;return(0,i.dy)`
      <wui-flex .padding=${["1","3","3","3"]} gap="2" alignItems="center">
        <wui-search-bar @inputChange=${this.onInputChange.bind(this)}></wui-search-bar>
        <wui-certified-switch
          ?checked=${"certified"===this.badge}
          @certifiedSwitchChange=${this.onCertifiedSwitchChange.bind(this)}
          data-testid="wui-certified-switch"
        ></wui-certified-switch>
        ${this.qrButtonTemplate()}
      </wui-flex>
      ${e||this.badge?(0,i.dy)`<w3m-all-wallets-search
            query=${this.search}
            .badge=${this.badge}
          ></w3m-all-wallets-search>`:(0,i.dy)`<w3m-all-wallets-list .badge=${this.badge}></w3m-all-wallets-list>`}
    `}onInputChange(e){this.onDebouncedSearch(e.detail)}onCertifiedSwitchChange(e){e.detail?(this.badge="certified",Z.SnackController.showSvg("Only WalletConnect certified",{icon:"walletConnectBrown",iconColor:"accent-100"})):this.badge=void 0}qrButtonTemplate(){return u.j.isMobile()?(0,i.dy)`
        <wui-icon-box
          size="xl"
          iconSize="xl"
          color="accent-primary"
          icon="qrCode"
          border
          borderColor="wui-accent-glass-010"
          @click=${this.onWalletConnectQr.bind(this)}
        ></wui-icon-box>
      `:null}onWalletConnectQr(){Q.RouterController.push("ConnectingWalletConnect")}};tT([(0,n.SB)()],tO.prototype,"search",void 0),tT([(0,n.SB)()],tO.prototype,"badge",void 0),tO=tT([(0,p.Mo)("w3m-all-wallets-view")],tO);var tN=o(39158),tj=o(88686),tP=(0,g.iv)`
  button {
    display: flex;
    gap: ${({spacing:e})=>e[1]};
    padding: ${({spacing:e})=>e[4]};
    width: 100%;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
    justify-content: center;
    align-items: center;
  }

  :host([data-size='sm']) button {
    padding: ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  :host([data-size='md']) button {
    padding: ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[3]};
  }

  button:hover {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  button:disabled {
    opacity: 0.5;
  }
`,tB=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let tD=class extends i.oi{constructor(){super(...arguments),this.text="",this.disabled=!1,this.size="lg",this.icon="copy",this.tabIdx=void 0}render(){this.dataset.size=this.size;let e=`${this.size}-regular`;return(0,i.dy)`
      <button ?disabled=${this.disabled} tabindex=${(0,r.o)(this.tabIdx)}>
        <wui-icon name=${this.icon} size=${this.size} color="default"></wui-icon>
        <wui-text align="center" variant=${e} color="primary">${this.text}</wui-text>
      </button>
    `}};tD.styles=[w.ET,w.ZM,tP],tB([(0,n.Cb)()],tD.prototype,"text",void 0),tB([(0,n.Cb)({type:Boolean})],tD.prototype,"disabled",void 0),tB([(0,n.Cb)()],tD.prototype,"size",void 0),tB([(0,n.Cb)()],tD.prototype,"icon",void 0),tB([(0,n.Cb)()],tD.prototype,"tabIdx",void 0),tD=tB([(0,m.M)("wui-list-button")],tD),o(59600);var tW=o(99013),tL=o(56008);o(6167);var tM=o(9681),t_=(0,p.iv)`
  wui-separator {
    margin: ${({spacing:e})=>e["3"]} calc(${({spacing:e})=>e["3"]} * -1);
    width: calc(100% + ${({spacing:e})=>e["3"]} * 2);
  }

  wui-email-input {
    width: 100%;
  }

  form {
    width: 100%;
    display: block;
    position: relative;
  }

  wui-icon-link,
  wui-loading-spinner {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  wui-icon-link {
    right: ${({spacing:e})=>e["2"]};
  }

  wui-loading-spinner {
    right: ${({spacing:e})=>e["3"]};
  }

  wui-text {
    margin: ${({spacing:e})=>e["2"]} ${({spacing:e})=>e["3"]}
      ${({spacing:e})=>e["0"]} ${({spacing:e})=>e["3"]};
  }
`,tz=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let tU=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.formRef=(0,tt.V)(),this.email="",this.loading=!1,this.error="",this.remoteFeatures=a.OptionsController.state.remoteFeatures,this.unsubscribe.push(a.OptionsController.subscribeKey("remoteFeatures",e=>{this.remoteFeatures=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}firstUpdated(){this.formRef.value?.addEventListener("keydown",e=>{"Enter"===e.key&&this.onSubmitEmail(e)})}render(){let e=ee.ConnectionController.hasAnyConnection(G.b.CONNECTOR_ID.AUTH);return(0,i.dy)`
      <form ${(0,tt.i)(this.formRef)} @submit=${this.onSubmitEmail.bind(this)}>
        <wui-email-input
          @focus=${this.onFocusEvent.bind(this)}
          .disabled=${this.loading}
          @inputChange=${this.onEmailInputChange.bind(this)}
          tabIdx=${(0,r.o)(this.tabIdx)}
          ?disabled=${e}
        >
        </wui-email-input>

        ${this.submitButtonTemplate()}${this.loadingTemplate()}
        <input type="submit" hidden />
      </form>
      ${this.templateError()}
    `}submitButtonTemplate(){return!this.loading&&this.email.length>3?(0,i.dy)`
          <wui-icon-link
            size="sm"
            icon="chevronRight"
            iconcolor="accent-100"
            @click=${this.onSubmitEmail.bind(this)}
          >
          </wui-icon-link>
        `:null}loadingTemplate(){return this.loading?(0,i.dy)`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:null}templateError(){return this.error?(0,i.dy)`<wui-text variant="sm-medium" color="error">${this.error}</wui-text>`:null}onEmailInputChange(e){this.email=e.detail.trim(),this.error=""}async onSubmitEmail(e){if(!ej.g.isValidEmail(this.email)){tL.AlertController.open({displayMessage:tM.j.ALERT_WARNINGS.INVALID_EMAIL.displayMessage},"warning");return}if(!G.b.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(e=>e===s.R.state.activeChain)){let e=s.R.getFirstCaipNetworkSupportsAuthConnector();if(e){Q.RouterController.push("SwitchNetwork",{network:e});return}}try{if(this.loading)return;this.loading=!0,e.preventDefault();let t=X.ConnectorController.getAuthConnector();if(!t)throw Error("w3m-email-login-widget: Auth connector not found");let{action:o}=await t.provider.connectEmail({email:this.email});if(W.X.sendEvent({type:"track",event:"EMAIL_SUBMITTED"}),"VERIFY_OTP"===o)W.X.sendEvent({type:"track",event:"EMAIL_VERIFICATION_CODE_SENT"}),Q.RouterController.push("EmailVerifyOtp",{email:this.email});else if("VERIFY_DEVICE"===o)Q.RouterController.push("EmailVerifyDevice",{email:this.email});else if("CONNECT"===o){let e=this.remoteFeatures?.multiWallet;await ee.ConnectionController.connectExternal(t,s.R.state.activeChain),e?(Q.RouterController.replace("ProfileWallets"),Z.SnackController.showSuccess("New Wallet Added")):Q.RouterController.replace("Account")}}catch(t){let e=u.j.parseError(t);e?.includes("Invalid email")?this.error="Invalid email. Try again.":Z.SnackController.showError(t)}finally{this.loading=!1}}onFocusEvent(){W.X.sendEvent({type:"track",event:"EMAIL_LOGIN_SELECTED"})}};tU.styles=t_,tz([(0,n.Cb)()],tU.prototype,"tabIdx",void 0),tz([(0,n.SB)()],tU.prototype,"email",void 0),tz([(0,n.SB)()],tU.prototype,"loading",void 0),tz([(0,n.SB)()],tU.prototype,"error",void 0),tz([(0,n.SB)()],tU.prototype,"remoteFeatures",void 0),tU=tz([(0,p.Mo)("w3m-email-login-widget")],tU),o(27912);var tF=o(1181);o(75022),o(51880);var tV=(0,g.iv)`
  :host {
    display: block;
    width: 100%;
  }

  button {
    width: 100%;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
  }

  @media (hover: hover) {
    button:hover:enabled {
      background: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`,tH=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let tK=class extends i.oi{constructor(){super(...arguments),this.logo="google",this.disabled=!1,this.tabIdx=void 0}render(){return(0,i.dy)`
      <button ?disabled=${this.disabled} tabindex=${(0,r.o)(this.tabIdx)}>
        <wui-icon size="xxl" name=${this.logo}></wui-icon>
      </button>
    `}};tK.styles=[w.ET,w.ZM,tV],tH([(0,n.Cb)()],tK.prototype,"logo",void 0),tH([(0,n.Cb)({type:Boolean})],tK.prototype,"disabled",void 0),tH([(0,n.Cb)()],tK.prototype,"tabIdx",void 0),tK=tH([(0,m.M)("wui-logo-select")],tK);var tq=o(84252),tG=(0,p.iv)`
  wui-separator {
    margin: ${({spacing:e})=>e["3"]} calc(${({spacing:e})=>e["3"]} * -1)
      ${({spacing:e})=>e["3"]} calc(${({spacing:e})=>e["3"]} * -1);
    width: calc(100% + ${({spacing:e})=>e["3"]} * 2);
  }
`,tX=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let tY=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.walletGuide="get-started",this.tabIdx=void 0,this.connectors=X.ConnectorController.state.connectors,this.remoteFeatures=a.OptionsController.state.remoteFeatures,this.authConnector=this.connectors.find(e=>"AUTH"===e.type),this.isPwaLoading=!1,this.unsubscribe.push(X.ConnectorController.subscribeKey("connectors",e=>{this.connectors=e,this.authConnector=this.connectors.find(e=>"AUTH"===e.type)}),a.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e))}connectedCallback(){super.connectedCallback(),this.handlePwaFrameLoad()}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return(0,i.dy)`
      <wui-flex
        class="container"
        flexDirection="column"
        gap="2"
        data-testid="w3m-social-login-widget"
      >
        ${this.topViewTemplate()}${this.bottomViewTemplate()}
      </wui-flex>
    `}topViewTemplate(){let e="explore"===this.walletGuide,t=this.remoteFeatures?.socials;return!t&&e?(t=Y.bq.DEFAULT_SOCIALS,this.renderTopViewContent(t)):t?this.renderTopViewContent(t):null}renderTopViewContent(e){return 2===e.length?(0,i.dy)` <wui-flex gap="2">
        ${e.slice(0,2).map(e=>(0,i.dy)`<wui-logo-select
              data-testid=${`social-selector-${e}`}
              @click=${()=>{this.onSocialClick(e)}}
              logo=${e}
              tabIdx=${(0,r.o)(this.tabIdx)}
              ?disabled=${this.isPwaLoading||this.hasConnection()}
            ></wui-logo-select>`)}
      </wui-flex>`:(0,i.dy)` <wui-list-button
      data-testid=${`social-selector-${e[0]}`}
      @click=${()=>{this.onSocialClick(e[0])}}
      size="lg"
      icon=${(0,r.o)(e[0])}
      text=${`Continue with ${p.Hg.capitalize(e[0])}`}
      tabIdx=${(0,r.o)(this.tabIdx)}
      ?disabled=${this.isPwaLoading||this.hasConnection()}
    ></wui-list-button>`}bottomViewTemplate(){let e=this.remoteFeatures?.socials,t="explore"===this.walletGuide;return(this.authConnector&&e&&0!==e.length||!t||(e=Y.bq.DEFAULT_SOCIALS),!e||e.length<=2)?null:e&&e.length>6?(0,i.dy)`<wui-flex gap="2">
        ${e.slice(1,5).map(e=>(0,i.dy)`<wui-logo-select
              data-testid=${`social-selector-${e}`}
              @click=${()=>{this.onSocialClick(e)}}
              logo=${e}
              tabIdx=${(0,r.o)(this.tabIdx)}
              ?focusable=${void 0!==this.tabIdx&&this.tabIdx>=0}
              ?disabled=${this.isPwaLoading||this.hasConnection()}
            ></wui-logo-select>`)}
        <wui-logo-select
          logo="more"
          tabIdx=${(0,r.o)(this.tabIdx)}
          @click=${this.onMoreSocialsClick.bind(this)}
          ?disabled=${this.isPwaLoading||this.hasConnection()}
          data-testid="social-selector-more"
        ></wui-logo-select>
      </wui-flex>`:e?(0,i.dy)`<wui-flex gap="2">
      ${e.slice(1,e.length).map(e=>(0,i.dy)`<wui-logo-select
            data-testid=${`social-selector-${e}`}
            @click=${()=>{this.onSocialClick(e)}}
            logo=${e}
            tabIdx=${(0,r.o)(this.tabIdx)}
            ?focusable=${void 0!==this.tabIdx&&this.tabIdx>=0}
            ?disabled=${this.isPwaLoading||this.hasConnection()}
          ></wui-logo-select>`)}
    </wui-flex>`:null}onMoreSocialsClick(){Q.RouterController.push("ConnectSocials")}async onSocialClick(e){if(!G.b.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(e=>e===s.R.state.activeChain)){let e=s.R.getFirstCaipNetworkSupportsAuthConnector();if(e){Q.RouterController.push("SwitchNetwork",{network:e});return}}e&&await (0,tF.y0)(e)}async handlePwaFrameLoad(){if(u.j.isPWA()){this.isPwaLoading=!0;try{this.authConnector?.provider instanceof tq.S&&await this.authConnector.provider.init()}catch(e){tL.AlertController.open({displayMessage:"Error loading embedded wallet in PWA",debugMessage:e.message},"error")}finally{this.isPwaLoading=!1}}}hasConnection(){return ee.ConnectionController.hasAnyConnection(G.b.CONNECTOR_ID.AUTH)}};tY.styles=tG,tX([(0,n.Cb)()],tY.prototype,"walletGuide",void 0),tX([(0,n.Cb)()],tY.prototype,"tabIdx",void 0),tX([(0,n.SB)()],tY.prototype,"connectors",void 0),tX([(0,n.SB)()],tY.prototype,"remoteFeatures",void 0),tX([(0,n.SB)()],tY.prototype,"authConnector",void 0),tX([(0,n.SB)()],tY.prototype,"isPwaLoading",void 0),tY=tX([(0,p.Mo)("w3m-social-login-widget")],tY),o(90453);var tZ=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let tJ=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=X.ConnectorController.state.connectors,this.count=tu.ApiController.state.count,this.filteredCount=tu.ApiController.state.filteredWallets.length,this.isFetchingRecommendedWallets=tu.ApiController.state.isFetchingRecommendedWallets,this.unsubscribe.push(X.ConnectorController.subscribeKey("connectors",e=>this.connectors=e),tu.ApiController.subscribeKey("count",e=>this.count=e),tu.ApiController.subscribeKey("filteredWallets",e=>this.filteredCount=e.length),tu.ApiController.subscribeKey("isFetchingRecommendedWallets",e=>this.isFetchingRecommendedWallets=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.connectors.find(e=>"walletConnect"===e.id),{allWallets:t}=a.OptionsController.state;if(!e||"HIDE"===t||"ONLY_MOBILE"===t&&!u.j.isMobile())return null;let o=tu.ApiController.state.featured.length,n=this.count+o,s=this.filteredCount>0?this.filteredCount:n<10?n:10*Math.floor(n/10),l=`${s}`;this.filteredCount>0?l=`${this.filteredCount}`:s<n&&(l=`${s}+`);let c=ee.ConnectionController.hasAnyConnection(G.b.CONNECTOR_ID.WALLET_CONNECT);return(0,i.dy)`
      <wui-list-wallet
        name="Search Wallet"
        walletIcon="search"
        showAllWallets
        @click=${this.onAllWallets.bind(this)}
        tagLabel=${l}
        tagVariant="info"
        data-testid="all-wallets"
        tabIdx=${(0,r.o)(this.tabIdx)}
        .loading=${this.isFetchingRecommendedWallets}
        ?disabled=${c}
        size="sm"
      ></wui-list-wallet>
    `}onAllWallets(){W.X.sendEvent({type:"track",event:"CLICK_ALL_WALLETS"}),Q.RouterController.push("AllWallets")}};tZ([(0,n.Cb)()],tJ.prototype,"tabIdx",void 0),tZ([(0,n.SB)()],tJ.prototype,"connectors",void 0),tZ([(0,n.SB)()],tJ.prototype,"count",void 0),tZ([(0,n.SB)()],tJ.prototype,"filteredCount",void 0),tZ([(0,n.SB)()],tJ.prototype,"isFetchingRecommendedWallets",void 0),tJ=tZ([(0,p.Mo)("w3m-all-wallets-widget")],tJ);var tQ=o(33692),t0=o(50875),t3=o(14232);let t1=(e,t,o)=>{let i=new Map;for(let n=t;n<=o;n++)i.set(e[n],n);return i},t2=(0,t0.XM)(class extends t0.Xe{constructor(e){if(super(e),e.type!==t0.pX.CHILD)throw Error("repeat() can only be used in text expressions")}dt(e,t,o){let i;void 0===o?o=t:void 0!==t&&(i=t);let n=[],r=[],a=0;for(let t of e)n[a]=i?i(t,a):a,r[a]=o(t,a),a++;return{values:r,keys:n}}render(e,t,o){return this.dt(e,t,o).values}update(e,[t,o,i]){let n=(0,t3.i9)(e),{values:r,keys:a}=this.dt(t,o,i);if(!Array.isArray(n))return this.ut=a,r;let s=this.ut??=[],l=[],c,d,u=0,h=n.length-1,p=0,w=r.length-1;for(;u<=h&&p<=w;)if(null===n[u])u++;else if(null===n[h])h--;else if(s[u]===a[p])l[p]=(0,t3.fk)(n[u],r[p]),u++,p++;else if(s[h]===a[w])l[w]=(0,t3.fk)(n[h],r[w]),h--,w--;else if(s[u]===a[w])l[w]=(0,t3.fk)(n[u],r[w]),(0,t3._Y)(e,l[w+1],n[u]),u++,w--;else if(s[h]===a[p])l[p]=(0,t3.fk)(n[h],r[p]),(0,t3._Y)(e,n[u],n[h]),h--,p++;else if(void 0===c&&(c=t1(a,p,w),d=t1(s,u,h)),c.has(s[u])){if(c.has(s[h])){let t=d.get(a[p]),o=void 0!==t?n[t]:null;if(null===o){let t=(0,t3._Y)(e,n[u]);(0,t3.fk)(t,r[p]),l[p]=t}else l[p]=(0,t3.fk)(o,r[p]),(0,t3._Y)(e,n[u],o),n[t]=null;p++}else(0,t3.ws)(n[h]),h--}else(0,t3.ws)(n[u]),u++;for(;p<=w;){let t=(0,t3._Y)(e,l[w+1]);(0,t3.fk)(t,r[p]),l[p++]=t}for(;u<=h;){let e=n[u++];null!==e&&(0,t3.ws)(e)}return this.ut=a,(0,t3.hl)(e,l),tQ.Jb}});var t5=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let t6=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.connectors=[],this.connections=ee.ConnectionController.state.connections,this.unsubscribe.push(ee.ConnectionController.subscribeKey("connections",e=>this.connections=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.connectors.filter(e=>"ANNOUNCED"===e.type);return e?.length?(0,i.dy)`
      <wui-flex flexDirection="column" gap="2">
        ${t2(e.filter(eN.C.showConnector),e=>e.id,e=>{let t=(this.connections.get(e.chain)??[]).some(t=>e1.g.isLowerCaseMatch(t.connectorId,e.id));return(0,i.dy)`
              <w3m-list-wallet
                imageSrc=${(0,r.o)(c.f.getConnectorImage(e))}
                name=${e.name??"Unknown"}
                @click=${()=>this.onConnector(e)}
                tagVariant=${t?"info":"success"}
                tagLabel=${t?"connected":"installed"}
                size="sm"
                data-testid=${`wallet-selector-${e.id}`}
                .installed=${!0}
                tabIdx=${(0,r.o)(this.tabIdx)}
                rdnsId=${(0,r.o)(e.explorerWallet?.rdns||void 0)}
                walletRank=${(0,r.o)(e.explorerWallet?.order)}
              >
              </w3m-list-wallet>
            `})}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnector(e){"walletConnect"===e.id?u.j.isMobile()?Q.RouterController.push("AllWallets"):Q.RouterController.push("ConnectingWalletConnect"):Q.RouterController.push("ConnectingExternal",{connector:e,wallet:e.explorerWallet})}};t5([(0,n.Cb)({type:Number})],t6.prototype,"tabIdx",void 0),t5([(0,n.Cb)({attribute:!1})],t6.prototype,"connectors",void 0),t5([(0,n.SB)()],t6.prototype,"connections",void 0),t6=t5([(0,p.Mo)("w3m-connect-announced-widget")],t6);var t4=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let t8=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=X.ConnectorController.state.connectors,this.loading=!1,this.unsubscribe.push(X.ConnectorController.subscribeKey("connectors",e=>this.connectors=e)),u.j.isTelegram()&&u.j.isIos()&&(this.loading=!ee.ConnectionController.state.wcUri,this.unsubscribe.push(ee.ConnectionController.subscribeKey("wcUri",e=>this.loading=!e)))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{customWallets:e}=a.OptionsController.state;if(!e?.length)return this.style.cssText="display: none",null;let t=this.filterOutDuplicateWallets(e),o=ee.ConnectionController.hasAnyConnection(G.b.CONNECTOR_ID.WALLET_CONNECT);return(0,i.dy)`<wui-flex flexDirection="column" gap="2">
      ${t.map(e=>(0,i.dy)`
          <w3m-list-wallet
            imageSrc=${(0,r.o)(c.f.getWalletImage(e))}
            name=${e.name??"Unknown"}
            @click=${()=>this.onConnectWallet(e)}
            size="sm"
            data-testid=${`wallet-selector-${e.id}`}
            tabIdx=${(0,r.o)(this.tabIdx)}
            ?loading=${this.loading}
            ?disabled=${o}
            rdnsId=${e.rdns}
            walletRank=${e.order}
          >
          </w3m-list-wallet>
        `)}
    </wui-flex>`}filterOutDuplicateWallets(e){let t=ea.M.getRecentWallets(),o=this.connectors.map(e=>e.info?.rdns).filter(Boolean),i=t.map(e=>e.rdns).filter(Boolean),n=o.concat(i);if(n.includes("io.metamask.mobile")&&u.j.isMobile()){let e=n.indexOf("io.metamask.mobile");n[e]="io.metamask"}return e.filter(e=>!n.includes(String(e?.rdns)))}onConnectWallet(e){this.loading||Q.RouterController.push("ConnectingWalletConnect",{wallet:e})}};t4([(0,n.Cb)()],t8.prototype,"tabIdx",void 0),t4([(0,n.SB)()],t8.prototype,"connectors",void 0),t4([(0,n.SB)()],t8.prototype,"loading",void 0),t8=t4([(0,p.Mo)("w3m-connect-custom-widget")],t8);var t7=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let t9=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=X.ConnectorController.state.connectors,this.unsubscribe.push(X.ConnectorController.subscribeKey("connectors",e=>this.connectors=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.connectors.filter(e=>"EXTERNAL"===e.type).filter(eN.C.showConnector).filter(e=>e.id!==G.b.CONNECTOR_ID.COINBASE_SDK);if(!e?.length)return this.style.cssText="display: none",null;let t=ee.ConnectionController.hasAnyConnection(G.b.CONNECTOR_ID.WALLET_CONNECT);return(0,i.dy)`
      <wui-flex flexDirection="column" gap="2">
        ${e.map(e=>(0,i.dy)`
            <w3m-list-wallet
              imageSrc=${(0,r.o)(c.f.getConnectorImage(e))}
              .installed=${!0}
              name=${e.name??"Unknown"}
              data-testid=${`wallet-selector-external-${e.id}`}
              size="sm"
              @click=${()=>this.onConnector(e)}
              tabIdx=${(0,r.o)(this.tabIdx)}
              ?disabled=${t}
              rdnsId=${e.explorerWallet?.rdns}
              walletRank=${e.explorerWallet?.order}
            >
            </w3m-list-wallet>
          `)}
      </wui-flex>
    `}onConnector(e){Q.RouterController.push("ConnectingExternal",{connector:e})}};t7([(0,n.Cb)()],t9.prototype,"tabIdx",void 0),t7([(0,n.SB)()],t9.prototype,"connectors",void 0),t9=t7([(0,p.Mo)("w3m-connect-external-widget")],t9);var oe=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let ot=class extends i.oi{constructor(){super(...arguments),this.tabIdx=void 0,this.wallets=[]}render(){if(!this.wallets.length)return this.style.cssText="display: none",null;let e=ee.ConnectionController.hasAnyConnection(G.b.CONNECTOR_ID.WALLET_CONNECT);return(0,i.dy)`
      <wui-flex flexDirection="column" gap="2">
        ${this.wallets.map(t=>(0,i.dy)`
            <w3m-list-wallet
              data-testid=${`wallet-selector-featured-${t.id}`}
              imageSrc=${(0,r.o)(c.f.getWalletImage(t))}
              name=${t.name??"Unknown"}
              @click=${()=>this.onConnectWallet(t)}
              tabIdx=${(0,r.o)(this.tabIdx)}
              size="sm"
              ?disabled=${e}
              rdnsId=${t.rdns}
              walletRank=${t.order}
            >
            </w3m-list-wallet>
          `)}
      </wui-flex>
    `}onConnectWallet(e){X.ConnectorController.selectWalletConnector(e)}};oe([(0,n.Cb)()],ot.prototype,"tabIdx",void 0),oe([(0,n.Cb)()],ot.prototype,"wallets",void 0),ot=oe([(0,p.Mo)("w3m-connect-featured-widget")],ot);var oo=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let oi=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.connectors=[],this.connections=ee.ConnectionController.state.connections,this.unsubscribe.push(ee.ConnectionController.subscribeKey("connections",e=>this.connections=e))}render(){let e=eN.C.sortConnectorsByExplorerWallet(this.connectors.filter(eN.C.showConnector));return 0===e.length?(this.style.cssText="display: none",null):(0,i.dy)`
      <wui-flex flexDirection="column" gap="2">
        ${t2(e,e=>e.id,e=>{let t=(this.connections.get(e.chain)??[]).some(t=>e1.g.isLowerCaseMatch(t.connectorId,e.id));return(0,i.dy)`
              <w3m-list-wallet
                imageSrc=${(0,r.o)(c.f.getConnectorImage(e))}
                .installed=${!0}
                name=${e.name??"Unknown"}
                tagVariant=${t?"info":"success"}
                tagLabel=${t?"connected":"installed"}
                data-testid=${`wallet-selector-${e.id}`}
                size="sm"
                @click=${()=>this.onConnector(e)}
                tabIdx=${(0,r.o)(this.tabIdx)}
                rdnsId=${(0,r.o)(e.explorerWallet?.rdns||void 0)}
                walletRank=${(0,r.o)(e.explorerWallet?.order)}
              >
              </w3m-list-wallet>
            `})}
      </wui-flex>
    `}onConnector(e){X.ConnectorController.setActiveConnector(e),Q.RouterController.push("ConnectingExternal",{connector:e,wallet:e.explorerWallet})}};oo([(0,n.Cb)({type:Number})],oi.prototype,"tabIdx",void 0),oo([(0,n.Cb)({attribute:!1})],oi.prototype,"connectors",void 0),oo([(0,n.SB)()],oi.prototype,"connections",void 0),oi=oo([(0,p.Mo)("w3m-connect-injected-widget")],oi);var on=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let or=class extends i.oi{constructor(){super(),this.tabIdx=void 0,this.connectors=[]}render(){let e=this.connectors.filter(e=>"MULTI_CHAIN"===e.type&&"WalletConnect"!==e.name);if(!e?.length)return this.style.cssText="display: none",null;let t=eN.C.sortConnectorsByExplorerWallet(e);return(0,i.dy)`
      <wui-flex flexDirection="column" gap="2">
        ${t.map(e=>(0,i.dy)`
            <w3m-list-wallet
              imageSrc=${(0,r.o)(c.f.getConnectorImage(e))}
              .installed=${!0}
              name=${e.name??"Unknown"}
              tagVariant="info"
              tagLabel="multichain"
              data-testid=${`wallet-selector-${e.id}`}
              size="sm"
              @click=${()=>this.onConnector(e)}
              tabIdx=${(0,r.o)(this.tabIdx)}
              rdnsId=${(0,r.o)(e.explorerWallet?.rdns||void 0)}
              walletRank=${(0,r.o)(e.explorerWallet?.order)}
            >
            </w3m-list-wallet>
          `)}
      </wui-flex>
    `}onConnector(e){X.ConnectorController.setActiveConnector(e),Q.RouterController.push("ConnectingMultiChain")}};on([(0,n.Cb)()],or.prototype,"tabIdx",void 0),on([(0,n.Cb)()],or.prototype,"connectors",void 0),or=on([(0,p.Mo)("w3m-connect-multi-chain-widget")],or);var oa=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let os=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=X.ConnectorController.state.connectors,this.loading=!1,this.unsubscribe.push(X.ConnectorController.subscribeKey("connectors",e=>this.connectors=e)),u.j.isTelegram()&&u.j.isIos()&&(this.loading=!ee.ConnectionController.state.wcUri,this.unsubscribe.push(ee.ConnectionController.subscribeKey("wcUri",e=>this.loading=!e)))}render(){let e=ea.M.getRecentWallets().filter(e=>!ty.J.isExcluded(e)).filter(e=>!this.hasWalletConnector(e)).filter(e=>this.isWalletCompatibleWithCurrentChain(e));if(!e.length)return this.style.cssText="display: none",null;let t=ee.ConnectionController.hasAnyConnection(G.b.CONNECTOR_ID.WALLET_CONNECT);return(0,i.dy)`
      <wui-flex flexDirection="column" gap="2">
        ${e.map(e=>(0,i.dy)`
            <w3m-list-wallet
              imageSrc=${(0,r.o)(c.f.getWalletImage(e))}
              name=${e.name??"Unknown"}
              @click=${()=>this.onConnectWallet(e)}
              tagLabel="recent"
              tagVariant="info"
              size="sm"
              tabIdx=${(0,r.o)(this.tabIdx)}
              ?loading=${this.loading}
              ?disabled=${t}
              rdnsId=${e.rdns}
              walletRank=${e.order}
            >
            </w3m-list-wallet>
          `)}
      </wui-flex>
    `}onConnectWallet(e){this.loading||X.ConnectorController.selectWalletConnector(e)}hasWalletConnector(e){return this.connectors.some(t=>t.id===e.id||t.name===e.name)}isWalletCompatibleWithCurrentChain(e){let t=s.R.state.activeChain;return!t||!e.chains||e.chains.some(e=>t===e.split(":")[0])}};oa([(0,n.Cb)()],os.prototype,"tabIdx",void 0),oa([(0,n.SB)()],os.prototype,"connectors",void 0),oa([(0,n.SB)()],os.prototype,"loading",void 0),os=oa([(0,p.Mo)("w3m-connect-recent-widget")],os);var ol=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let oc=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.wallets=[],this.loading=!1,u.j.isTelegram()&&u.j.isIos()&&(this.loading=!ee.ConnectionController.state.wcUri,this.unsubscribe.push(ee.ConnectionController.subscribeKey("wcUri",e=>this.loading=!e)))}render(){let{connectors:e}=X.ConnectorController.state,{customWallets:t,featuredWalletIds:o}=a.OptionsController.state,n=e.find(e=>"walletConnect"===e.id),s=e.filter(e=>"INJECTED"===e.type||"ANNOUNCED"===e.type||"MULTI_CHAIN"===e.type);if(!n&&!s.length&&!t?.length)return null;let l=!!(a.OptionsController.state.features?.email||a.OptionsController.state.remoteFeatures?.email),d=Array.isArray(a.OptionsController.state.features?.socials)&&a.OptionsController.state.features?.socials.length>0||Array.isArray(a.OptionsController.state.remoteFeatures?.socials)&&a.OptionsController.state.remoteFeatures?.socials.length>0,u=s.filter(e=>"Browser Wallet"!==e.name),h=o?.length||0,p=h+(t?.length||0)+(u.length||0)+(l?1:0)+(d?1:0);if(p>=4)return this.style.cssText="display: none",null;let w=ty.J.filterOutDuplicateWallets(this.wallets).slice(0,4-p);if(!w.length)return this.style.cssText="display: none",null;let b=ee.ConnectionController.hasAnyConnection(G.b.CONNECTOR_ID.WALLET_CONNECT);return(0,i.dy)`
      <wui-flex flexDirection="column" gap="2">
        ${w.map(e=>(0,i.dy)`
            <w3m-list-wallet
              imageSrc=${(0,r.o)(c.f.getWalletImage(e))}
              name=${e?.name??"Unknown"}
              @click=${()=>this.onConnectWallet(e)}
              size="sm"
              tabIdx=${(0,r.o)(this.tabIdx)}
              ?loading=${this.loading}
              ?disabled=${b}
              rdnsId=${e.rdns}
              walletRank=${e.order}
            >
            </w3m-list-wallet>
          `)}
      </wui-flex>
    `}onConnectWallet(e){if(this.loading)return;let t=X.ConnectorController.getConnector({id:e.id,rdns:e.rdns});t?Q.RouterController.push("ConnectingExternal",{connector:t}):Q.RouterController.push("ConnectingWalletConnect",{wallet:e})}};ol([(0,n.Cb)()],oc.prototype,"tabIdx",void 0),ol([(0,n.Cb)()],oc.prototype,"wallets",void 0),ol([(0,n.SB)()],oc.prototype,"loading",void 0),oc=ol([(0,p.Mo)("w3m-connect-recommended-widget")],oc);var od=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let ou=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=X.ConnectorController.state.connectors,this.connectorImages=l.W.state.connectorImages,this.unsubscribe.push(X.ConnectorController.subscribeKey("connectors",e=>this.connectors=e),l.W.subscribeKey("connectorImages",e=>this.connectorImages=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(u.j.isMobile())return this.style.cssText="display: none",null;let e=this.connectors.find(e=>"walletConnect"===e.id);if(!e)return this.style.cssText="display: none",null;let t=e.imageUrl||this.connectorImages[e?.imageId??""],o=ee.ConnectionController.hasAnyConnection(G.b.CONNECTOR_ID.WALLET_CONNECT);return(0,i.dy)`
      <w3m-list-wallet
        imageSrc=${(0,r.o)(t)}
        name=${e.name??"Unknown"}
        @click=${()=>this.onConnector(e)}
        tagLabel="qr code"
        tagVariant="accent"
        tabIdx=${(0,r.o)(this.tabIdx)}
        data-testid="wallet-selector-walletconnect"
        size="sm"
        ?disabled=${o}
        rdnsId=${e.explorerWallet?.rdns}
      >
      </w3m-list-wallet>
    `}onConnector(e){X.ConnectorController.setActiveConnector(e),Q.RouterController.push("ConnectingWalletConnect")}};od([(0,n.Cb)()],ou.prototype,"tabIdx",void 0),od([(0,n.SB)()],ou.prototype,"connectors",void 0),od([(0,n.SB)()],ou.prototype,"connectorImages",void 0),ou=od([(0,p.Mo)("w3m-connect-walletconnect-widget")],ou);var oh=(0,p.iv)`
  :host {
    margin-top: ${({spacing:e})=>e["1"]};
  }
  wui-separator {
    margin: ${({spacing:e})=>e["3"]} calc(${({spacing:e})=>e["3"]} * -1)
      ${({spacing:e})=>e["2"]} calc(${({spacing:e})=>e["3"]} * -1);
    width: calc(100% + ${({spacing:e})=>e["3"]} * 2);
  }
`,op=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let ow=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.connectors=X.ConnectorController.state.connectors,this.recommended=tu.ApiController.state.recommended,this.featured=tu.ApiController.state.featured,this.explorerWallets=tu.ApiController.state.explorerWallets,this.unsubscribe.push(X.ConnectorController.subscribeKey("connectors",e=>this.connectors=e),tu.ApiController.subscribeKey("recommended",e=>this.recommended=e),tu.ApiController.subscribeKey("featured",e=>this.featured=e),tu.ApiController.subscribeKey("explorerFilteredWallets",e=>{this.explorerWallets=e?.length?e:tu.ApiController.state.explorerWallets}),tu.ApiController.subscribeKey("explorerWallets",e=>{this.explorerWallets?.length||(this.explorerWallets=e)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return(0,i.dy)`
      <wui-flex flexDirection="column" gap="2"> ${this.connectorListTemplate()} </wui-flex>
    `}mapConnectorsToExplorerWallets(e,t){return e.map(e=>{if("MULTI_CHAIN"===e.type&&e.connectors){let o=e.connectors.map(e=>e.id),i=e.connectors.map(e=>e.name),n=e.connectors.map(e=>e.info?.rdns),r=t?.find(e=>o.includes(e.id)||i.includes(e.name)||e.rdns&&(n.includes(e.rdns)||o.includes(e.rdns)));return e.explorerWallet=r??e.explorerWallet,e}let o=t?.find(t=>t.id===e.id||t.rdns===e.info?.rdns||t.name===e.name);return e.explorerWallet=o??e.explorerWallet,e})}processConnectorsByType(e,t=!0){if(!this.explorerWallets?.length)return e;let o=eN.C.sortConnectorsByExplorerWallet([...e]);return t?o.filter(eN.C.showConnector):o}connectorListTemplate(){let e=this.mapConnectorsToExplorerWallets(this.connectors,this.explorerWallets??[]),t=eN.C.getConnectorsByType(e,this.recommended,this.featured),o=this.processConnectorsByType(t.announced),n=this.processConnectorsByType(t.injected),a=this.processConnectorsByType(t.multiChain,!1),s=t.custom,l=t.recent,c=t.external,d=t.recommended,u=t.featured;return eN.C.getConnectorTypeOrder({custom:s,recent:l,announced:o,injected:n,multiChain:a,recommended:d,featured:u,external:c}).map(e=>{switch(e){case"injected":return(0,i.dy)`
            ${a.length?(0,i.dy)`<w3m-connect-multi-chain-widget
                  tabIdx=${(0,r.o)(this.tabIdx)}
                  .connectors=${a}
                ></w3m-connect-multi-chain-widget>`:null}
            ${o.length?(0,i.dy)`<w3m-connect-announced-widget
                  tabIdx=${(0,r.o)(this.tabIdx)}
                  .connectors=${o}
                ></w3m-connect-announced-widget>`:null}
            ${n.length?(0,i.dy)`<w3m-connect-injected-widget
                  .connectors=${n}
                  tabIdx=${(0,r.o)(this.tabIdx)}
                ></w3m-connect-injected-widget>`:null}
          `;case"walletConnect":return(0,i.dy)`<w3m-connect-walletconnect-widget
            tabIdx=${(0,r.o)(this.tabIdx)}
          ></w3m-connect-walletconnect-widget>`;case"recent":return(0,i.dy)`<w3m-connect-recent-widget
            tabIdx=${(0,r.o)(this.tabIdx)}
          ></w3m-connect-recent-widget>`;case"featured":return(0,i.dy)`<w3m-connect-featured-widget
            .wallets=${u}
            tabIdx=${(0,r.o)(this.tabIdx)}
          ></w3m-connect-featured-widget>`;case"custom":return(0,i.dy)`<w3m-connect-custom-widget
            tabIdx=${(0,r.o)(this.tabIdx)}
          ></w3m-connect-custom-widget>`;case"external":return(0,i.dy)`<w3m-connect-external-widget
            tabIdx=${(0,r.o)(this.tabIdx)}
          ></w3m-connect-external-widget>`;case"recommended":return(0,i.dy)`<w3m-connect-recommended-widget
            .wallets=${d}
            tabIdx=${(0,r.o)(this.tabIdx)}
          ></w3m-connect-recommended-widget>`;default:return console.warn(`Unknown connector type: ${e}`),null}})}};ow.styles=oh,op([(0,n.Cb)({type:Number})],ow.prototype,"tabIdx",void 0),op([(0,n.SB)()],ow.prototype,"connectors",void 0),op([(0,n.SB)()],ow.prototype,"recommended",void 0),op([(0,n.SB)()],ow.prototype,"featured",void 0),op([(0,n.SB)()],ow.prototype,"explorerWallets",void 0),ow=op([(0,p.Mo)("w3m-connector-list")],ow);var ob=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let om=class extends i.oi{constructor(){super(...arguments),this.tabIdx=void 0}render(){return(0,i.dy)`
      <wui-flex flexDirection="column" gap="2">
        <w3m-connector-list tabIdx=${(0,r.o)(this.tabIdx)}></w3m-connector-list>
        <w3m-all-wallets-widget tabIdx=${(0,r.o)(this.tabIdx)}></w3m-all-wallets-widget>
      </wui-flex>
    `}};ob([(0,n.Cb)()],om.prototype,"tabIdx",void 0),om=ob([(0,p.Mo)("w3m-wallet-login-list")],om);var og=(0,p.iv)`
  :host {
    --connect-scroll--top-opacity: 0;
    --connect-scroll--bottom-opacity: 0;
    --connect-mask-image: none;
  }

  .connect {
    max-height: clamp(360px, 470px, 80vh);
    scrollbar-width: none;
    overflow-y: scroll;
    overflow-x: hidden;
    transition: opacity ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity;
    mask-image: var(--connect-mask-image);
  }

  .guide {
    transition: opacity ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity;
  }

  .connect::-webkit-scrollbar {
    display: none;
  }

  .all-wallets {
    flex-flow: column;
  }

  .connect.disabled,
  .guide.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }

  wui-separator {
    margin: ${({spacing:e})=>e["3"]} calc(${({spacing:e})=>e["3"]} * -1);
    width: calc(100% + ${({spacing:e})=>e["3"]} * 2);
  }
`,of=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let oy=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.connectors=X.ConnectorController.state.connectors,this.authConnector=this.connectors.find(e=>"AUTH"===e.type),this.features=a.OptionsController.state.features,this.remoteFeatures=a.OptionsController.state.remoteFeatures,this.enableWallets=a.OptionsController.state.enableWallets,this.noAdapters=s.R.state.noAdapters,this.walletGuide="get-started",this.checked=tj.M.state.isLegalCheckboxChecked,this.isEmailEnabled=this.remoteFeatures?.email&&!s.R.state.noAdapters,this.isSocialEnabled=this.remoteFeatures?.socials&&this.remoteFeatures.socials.length>0&&!s.R.state.noAdapters,this.isAuthEnabled=this.checkIfAuthEnabled(this.connectors),this.unsubscribe.push(X.ConnectorController.subscribeKey("connectors",e=>{this.connectors=e,this.authConnector=this.connectors.find(e=>"AUTH"===e.type),this.isAuthEnabled=this.checkIfAuthEnabled(this.connectors)}),a.OptionsController.subscribeKey("features",e=>{this.features=e}),a.OptionsController.subscribeKey("remoteFeatures",e=>{this.remoteFeatures=e,this.setEmailAndSocialEnableCheck(this.noAdapters,this.remoteFeatures)}),a.OptionsController.subscribeKey("enableWallets",e=>this.enableWallets=e),s.R.subscribeKey("noAdapters",e=>this.setEmailAndSocialEnableCheck(e,this.remoteFeatures)),tj.M.subscribeKey("isLegalCheckboxChecked",e=>this.checked=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.resizeObserver?.disconnect();let e=this.shadowRoot?.querySelector(".connect");e?.removeEventListener("scroll",this.handleConnectListScroll.bind(this))}firstUpdated(){let e=this.shadowRoot?.querySelector(".connect");e&&(requestAnimationFrame(this.handleConnectListScroll.bind(this)),e?.addEventListener("scroll",this.handleConnectListScroll.bind(this)),this.resizeObserver=new ResizeObserver(()=>{this.handleConnectListScroll()}),this.resizeObserver?.observe(e),this.handleConnectListScroll())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=a.OptionsController.state,o=a.OptionsController.state.features?.legalCheckbox,n=!!(e||t)&&!!o&&"get-started"===this.walletGuide&&!this.checked,r=a.OptionsController.state.enableWalletGuide,s=this.enableWallets,l=this.isSocialEnabled||this.authConnector;return(0,i.dy)`
      <wui-flex flexDirection="column">
        ${this.legalCheckboxTemplate()}
        <wui-flex
          data-testid="w3m-connect-scroll-view"
          flexDirection="column"
          .padding=${["0","0","4","0"]}
          class=${(0,eq.$)({connect:!0,disabled:n})}
        >
          <wui-flex
            class="connect-methods"
            flexDirection="column"
            gap="2"
            .padding=${l&&s&&r&&"get-started"===this.walletGuide?["0","3","0","3"]:["0","3","3","3"]}
          >
            ${this.renderConnectMethod(n?-1:void 0)}
          </wui-flex>
        </wui-flex>
        ${this.reownBrandingTemplate()}
      </wui-flex>
    `}reownBrandingTemplate(){return ej.g.hasFooter()||!this.remoteFeatures?.reownBranding?null:(0,i.dy)`<wui-ux-by-reown></wui-ux-by-reown>`}setEmailAndSocialEnableCheck(e,t){this.isEmailEnabled=t?.email&&!e,this.isSocialEnabled=t?.socials&&t.socials.length>0&&!e,this.remoteFeatures=t,this.noAdapters=e}checkIfAuthEnabled(e){let t=e.filter(e=>e.type===tW.b.CONNECTOR_TYPE_AUTH).map(e=>e.chain);return G.b.AUTH_CONNECTOR_SUPPORTED_CHAINS.some(e=>t.includes(e))}renderConnectMethod(e){let t=ty.J.getConnectOrderMethod(this.features,this.connectors);return(0,i.dy)`${t.map((t,o)=>{switch(t){case"email":return(0,i.dy)`${this.emailTemplate(e)} ${this.separatorTemplate(o,"email")}`;case"social":return(0,i.dy)`${this.socialListTemplate(e)}
          ${this.separatorTemplate(o,"social")}`;case"wallet":return(0,i.dy)`${this.walletListTemplate(e)}
          ${this.separatorTemplate(o,"wallet")}`;default:return null}})}`}checkMethodEnabled(e){switch(e){case"wallet":return this.enableWallets;case"social":return this.isSocialEnabled&&this.isAuthEnabled;case"email":return this.isEmailEnabled&&this.isAuthEnabled;default:return null}}checkIsThereNextMethod(e){let t=ty.J.getConnectOrderMethod(this.features,this.connectors)[e+1];return t?this.checkMethodEnabled(t)?t:this.checkIsThereNextMethod(e+1):void 0}separatorTemplate(e,t){let o=this.checkIsThereNextMethod(e),n="explore"===this.walletGuide;switch(t){case"wallet":return this.enableWallets&&o&&!n?(0,i.dy)`<wui-separator data-testid="wui-separator" text="or"></wui-separator>`:null;case"email":return this.isAuthEnabled&&this.isEmailEnabled&&"social"!==o&&o?(0,i.dy)`<wui-separator
              data-testid="w3m-email-login-or-separator"
              text="or"
            ></wui-separator>`:null;case"social":return this.isAuthEnabled&&this.isSocialEnabled&&"email"!==o&&o?(0,i.dy)`<wui-separator data-testid="wui-separator" text="or"></wui-separator>`:null;default:return null}}emailTemplate(e){return this.isEmailEnabled&&this.isAuthEnabled?(0,i.dy)`<w3m-email-login-widget tabIdx=${(0,r.o)(e)}></w3m-email-login-widget>`:null}socialListTemplate(e){return this.isSocialEnabled&&this.isAuthEnabled?(0,i.dy)`<w3m-social-login-widget
      walletGuide=${this.walletGuide}
      tabIdx=${(0,r.o)(e)}
    ></w3m-social-login-widget>`:null}walletListTemplate(e){let t=this.enableWallets,o=this.features?.emailShowWallets===!1,n=this.features?.collapseWallets;return t?(u.j.isTelegram()&&(u.j.isSafari()||u.j.isIos())&&ee.ConnectionController.connectWalletConnect().catch(e=>({})),"explore"===this.walletGuide)?null:this.isAuthEnabled&&(this.isEmailEnabled||this.isSocialEnabled)&&(o||n)?(0,i.dy)`<wui-list-button
        data-testid="w3m-collapse-wallets-button"
        tabIdx=${(0,r.o)(e)}
        @click=${this.onContinueWalletClick.bind(this)}
        text="Continue with a wallet"
      ></wui-list-button>`:(0,i.dy)`<w3m-wallet-login-list tabIdx=${(0,r.o)(e)}></w3m-wallet-login-list>`:null}legalCheckboxTemplate(){return"explore"===this.walletGuide?null:(0,i.dy)`<w3m-legal-checkbox data-testid="w3m-legal-checkbox"></w3m-legal-checkbox>`}handleConnectListScroll(){let e=this.shadowRoot?.querySelector(".connect");e&&(e.scrollHeight>470?(e.style.setProperty("--connect-mask-image",`linear-gradient(
          to bottom,
          rgba(0, 0, 0, calc(1 - var(--connect-scroll--top-opacity))) 0px,
          rgba(200, 200, 200, calc(1 - var(--connect-scroll--top-opacity))) 1px,
          black 100px,
          black calc(100% - 100px),
          rgba(155, 155, 155, calc(1 - var(--connect-scroll--bottom-opacity))) calc(100% - 1px),
          rgba(0, 0, 0, calc(1 - var(--connect-scroll--bottom-opacity))) 100%
        )`),e.style.setProperty("--connect-scroll--top-opacity",p.kj.interpolate([0,50],[0,1],e.scrollTop).toString()),e.style.setProperty("--connect-scroll--bottom-opacity",p.kj.interpolate([0,50],[0,1],e.scrollHeight-e.scrollTop-e.offsetHeight).toString())):(e.style.setProperty("--connect-mask-image","none"),e.style.setProperty("--connect-scroll--top-opacity","0"),e.style.setProperty("--connect-scroll--bottom-opacity","0")))}onContinueWalletClick(){Q.RouterController.push("ConnectWallets")}};oy.styles=og,of([(0,tN.S)()],oy.prototype,"connectors",void 0),of([(0,tN.S)()],oy.prototype,"authConnector",void 0),of([(0,tN.S)()],oy.prototype,"features",void 0),of([(0,tN.S)()],oy.prototype,"remoteFeatures",void 0),of([(0,tN.S)()],oy.prototype,"enableWallets",void 0),of([(0,tN.S)()],oy.prototype,"noAdapters",void 0),of([(0,n.Cb)()],oy.prototype,"walletGuide",void 0),of([(0,tN.S)()],oy.prototype,"checked",void 0),of([(0,tN.S)()],oy.prototype,"isEmailEnabled",void 0),of([(0,tN.S)()],oy.prototype,"isSocialEnabled",void 0),of([(0,tN.S)()],oy.prototype,"isAuthEnabled",void 0),oy=of([(0,p.Mo)("w3m-connect-view")],oy);var oC=o(22213),ov=o(68343),ox=o(12858);o(69804),o(7013);var o$=(0,g.iv)`
  wui-flex {
    width: 100%;
    height: 52px;
    box-sizing: border-box;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[5]};
    padding-left: ${({spacing:e})=>e[3]};
    padding-right: ${({spacing:e})=>e[3]};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({spacing:e})=>e[6]};
  }

  wui-text {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  wui-icon {
    width: 12px;
    height: 12px;
  }
`,ok=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let oS=class extends i.oi{constructor(){super(...arguments),this.disabled=!1,this.label="",this.buttonLabel=""}render(){return(0,i.dy)`
      <wui-flex justifyContent="space-between" alignItems="center">
        <wui-text variant="lg-regular" color="inherit">${this.label}</wui-text>
        <wui-button variant="accent-secondary" size="sm">
          ${this.buttonLabel}
          <wui-icon name="chevronRight" color="inherit" size="inherit" slot="iconRight"></wui-icon>
        </wui-button>
      </wui-flex>
    `}};oS.styles=[w.ET,w.ZM,o$],ok([(0,n.Cb)({type:Boolean})],oS.prototype,"disabled",void 0),ok([(0,n.Cb)()],oS.prototype,"label",void 0),ok([(0,n.Cb)()],oS.prototype,"buttonLabel",void 0),oS=ok([(0,m.M)("wui-cta-button")],oS);var oR=(0,p.iv)`
  :host {
    display: block;
    padding: 0 ${({spacing:e})=>e["5"]} ${({spacing:e})=>e["5"]};
  }
`,oE=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let oA=class extends i.oi{constructor(){super(...arguments),this.wallet=void 0}render(){if(!this.wallet)return this.style.display="none",null;let{name:e,app_store:t,play_store:o,chrome_store:n,homepage:r}=this.wallet,a=u.j.isMobile(),s=u.j.isIos(),l=u.j.isAndroid(),c=[t,o,r,n].filter(Boolean).length>1,d=p.Hg.getTruncateString({string:e,charsStart:12,charsEnd:0,truncate:"end"});return c&&!a?(0,i.dy)`
        <wui-cta-button
          label=${`Don't have ${d}?`}
          buttonLabel="Get"
          @click=${()=>Q.RouterController.push("Downloads",{wallet:this.wallet})}
        ></wui-cta-button>
      `:!c&&r?(0,i.dy)`
        <wui-cta-button
          label=${`Don't have ${d}?`}
          buttonLabel="Get"
          @click=${this.onHomePage.bind(this)}
        ></wui-cta-button>
      `:t&&s?(0,i.dy)`
        <wui-cta-button
          label=${`Don't have ${d}?`}
          buttonLabel="Get"
          @click=${this.onAppStore.bind(this)}
        ></wui-cta-button>
      `:o&&l?(0,i.dy)`
        <wui-cta-button
          label=${`Don't have ${d}?`}
          buttonLabel="Get"
          @click=${this.onPlayStore.bind(this)}
        ></wui-cta-button>
      `:(this.style.display="none",null)}onAppStore(){this.wallet?.app_store&&u.j.openHref(this.wallet.app_store,"_blank")}onPlayStore(){this.wallet?.play_store&&u.j.openHref(this.wallet.play_store,"_blank")}onHomePage(){this.wallet?.homepage&&u.j.openHref(this.wallet.homepage,"_blank")}};oA.styles=[oR],oE([(0,n.Cb)({type:Object})],oA.prototype,"wallet",void 0),oA=oE([(0,p.Mo)("w3m-mobile-download-links")],oA);var oI=(0,p.iv)`
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

  wui-wallet-image {
    width: 56px;
    height: 56px;
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
    transition-property: opacity, transform;
    transition-duration: ${({durations:e})=>e.lg};
    transition-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity, transform;
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

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }

  w3m-mobile-download-links {
    padding: 0px;
    width: 100%;
  }
`,oT=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};class oO extends i.oi{constructor(){super(),this.wallet=Q.RouterController.state.data?.wallet,this.connector=Q.RouterController.state.data?.connector,this.timeout=void 0,this.secondaryBtnIcon="refresh",this.onConnect=void 0,this.onRender=void 0,this.onAutoConnect=void 0,this.isWalletConnect=!0,this.unsubscribe=[],this.imageSrc=c.f.getConnectorImage(this.connector)??c.f.getWalletImage(this.wallet),this.name=this.wallet?.name??this.connector?.name??"Wallet",this.isRetrying=!1,this.uri=ee.ConnectionController.state.wcUri,this.error=ee.ConnectionController.state.wcError,this.ready=!1,this.showRetry=!1,this.label=void 0,this.secondaryBtnLabel="Try again",this.secondaryLabel="Accept connection request in the wallet",this.isLoading=!1,this.isMobile=!1,this.onRetry=void 0,this.unsubscribe.push(ee.ConnectionController.subscribeKey("wcUri",e=>{this.uri=e,this.isRetrying&&this.onRetry&&(this.isRetrying=!1,this.onConnect?.())}),ee.ConnectionController.subscribeKey("wcError",e=>this.error=e)),(u.j.isTelegram()||u.j.isSafari())&&u.j.isIos()&&ee.ConnectionController.state.wcUri&&this.onConnect?.()}firstUpdated(){this.onAutoConnect?.(),this.showRetry=!this.onAutoConnect}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),ee.ConnectionController.setWcError(!1),clearTimeout(this.timeout)}render(){this.onRender?.(),this.onShowRetry();let e=this.error?"Connection can be declined if a previous request is still active":this.secondaryLabel,t="";return this.label?t=this.label:(t=`Continue in ${this.name}`,this.error&&(t="Connection declined")),(0,i.dy)`
      <wui-flex
        data-error=${(0,r.o)(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","5","5"]}
        gap="6"
      >
        <wui-flex gap="2" justifyContent="center" alignItems="center">
          <wui-wallet-image size="lg" imageSrc=${(0,r.o)(this.imageSrc)}></wui-wallet-image>

          ${this.error?null:this.loaderTemplate()}

          <wui-icon-box
            color="error"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="6"> <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${["2","0","0","0"]}
        >
          <wui-text align="center" variant="lg-medium" color=${this.error?"error":"primary"}>
            ${t}
          </wui-text>
          <wui-text align="center" variant="lg-regular" color="secondary">${e}</wui-text>
        </wui-flex>

        ${this.secondaryBtnLabel?(0,i.dy)`
                <wui-button
                  variant="neutral-secondary"
                  size="md"
                  ?disabled=${this.isRetrying||this.isLoading}
                  @click=${this.onTryAgain.bind(this)}
                  data-testid="w3m-connecting-widget-secondary-button"
                >
                  <wui-icon
                    color="inherit"
                    slot="iconLeft"
                    name=${this.secondaryBtnIcon}
                  ></wui-icon>
                  ${this.secondaryBtnLabel}
                </wui-button>
              `:null}
      </wui-flex>

      ${this.isWalletConnect?(0,i.dy)`
              <wui-flex .padding=${["0","5","5","5"]} justifyContent="center">
                <wui-link
                  @click=${this.onCopyUri}
                  variant="secondary"
                  icon="copy"
                  data-testid="wui-link-copy"
                >
                  Copy link
                </wui-link>
              </wui-flex>
            `:null}

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links></wui-flex>
      </wui-flex>
    `}onShowRetry(){if(this.error&&!this.showRetry){this.showRetry=!0;let e=this.shadowRoot?.querySelector("wui-button");e?.animate([{opacity:0},{opacity:1}],{fill:"forwards",easing:"ease"})}}onTryAgain(){ee.ConnectionController.setWcError(!1),this.onRetry?(this.isRetrying=!0,this.onRetry?.()):this.onConnect?.()}loaderTemplate(){let e=ox.ThemeController.state.themeVariables["--w3m-border-radius-master"],t=e?parseInt(e.replace("px",""),10):4;return(0,i.dy)`<wui-loading-thumbnail radius=${9*t}></wui-loading-thumbnail>`}onCopyUri(){try{this.uri&&(u.j.copyToClopboard(this.uri),Z.SnackController.showSuccess("Link copied"))}catch{Z.SnackController.showError("Failed to copy")}}}oO.styles=oI,oT([(0,n.SB)()],oO.prototype,"isRetrying",void 0),oT([(0,n.SB)()],oO.prototype,"uri",void 0),oT([(0,n.SB)()],oO.prototype,"error",void 0),oT([(0,n.SB)()],oO.prototype,"ready",void 0),oT([(0,n.SB)()],oO.prototype,"showRetry",void 0),oT([(0,n.SB)()],oO.prototype,"label",void 0),oT([(0,n.SB)()],oO.prototype,"secondaryBtnLabel",void 0),oT([(0,n.SB)()],oO.prototype,"secondaryLabel",void 0),oT([(0,n.SB)()],oO.prototype,"isLoading",void 0),oT([(0,n.Cb)({type:Boolean})],oO.prototype,"isMobile",void 0),oT([(0,n.Cb)()],oO.prototype,"onRetry",void 0);let oN=class extends oO{constructor(){if(super(),this.externalViewUnsubscribe=[],this.connectionsByNamespace=ee.ConnectionController.getConnections(this.connector?.chain),this.hasMultipleConnections=this.connectionsByNamespace.length>0,this.remoteFeatures=a.OptionsController.state.remoteFeatures,this.currentActiveConnectorId=X.ConnectorController.state.activeConnectorIds[this.connector?.chain],!this.connector)throw Error("w3m-connecting-view: No connector provided");let e=this.connector?.chain;this.isAlreadyConnected(this.connector)&&(this.secondaryBtnLabel=void 0,this.label=`This account is already linked, change your account in ${this.connector.name}`,this.secondaryLabel=`To link a new account, open ${this.connector.name} and switch to the account you want to link`),W.X.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.connector.name??"Unknown",platform:"browser",displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:Q.RouterController.state.view}}),this.onConnect=this.onConnectProxy.bind(this),this.onAutoConnect=this.onConnectProxy.bind(this),this.isWalletConnect=!1,this.externalViewUnsubscribe.push(X.ConnectorController.subscribeKey("activeConnectorIds",t=>{let o=t[e],i=this.remoteFeatures?.multiWallet;o!==this.currentActiveConnectorId&&(this.hasMultipleConnections&&i?(Q.RouterController.replace("ProfileWallets"),Z.SnackController.showSuccess("New Wallet Added")):h.I.close())}),ee.ConnectionController.subscribeKey("connections",this.onConnectionsChange.bind(this)))}disconnectedCallback(){this.externalViewUnsubscribe.forEach(e=>e())}async onConnectProxy(){try{if(this.error=!1,this.connector){if(this.isAlreadyConnected(this.connector))return;this.connector.id===G.b.CONNECTOR_ID.COINBASE_SDK&&this.error||(await ee.ConnectionController.connectExternal(this.connector,this.connector.chain),W.X.sendEvent({type:"track",event:"CONNECT_SUCCESS",properties:{method:"browser",name:this.connector.name||"Unknown",view:Q.RouterController.state.view,walletRank:this.wallet?.order}}))}}catch(e){e instanceof ov.g&&e.originalName===oC.jD.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?W.X.sendEvent({type:"track",event:"USER_REJECTED",properties:{message:e.message}}):W.X.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:e?.message??"Unknown"}}),this.error=!0}}onConnectionsChange(e){if(this.connector?.chain&&e.get(this.connector.chain)&&this.isAlreadyConnected(this.connector)){let t=e.get(this.connector.chain)??[],o=this.remoteFeatures?.multiWallet;if(0===t.length)Q.RouterController.replace("Connect");else{let e=eX.f.getConnectionsByConnectorId(this.connectionsByNamespace,this.connector.id).flatMap(e=>e.accounts),i=eX.f.getConnectionsByConnectorId(t,this.connector.id).flatMap(e=>e.accounts);0===i.length?this.hasMultipleConnections&&o?(Q.RouterController.replace("ProfileWallets"),Z.SnackController.showSuccess("Wallet deleted")):h.I.close():!e.every(e=>i.some(t=>e1.g.isLowerCaseMatch(e.address,t.address)))&&o&&Q.RouterController.replace("ProfileWallets")}}}isAlreadyConnected(e){return!!e&&this.connectionsByNamespace.some(t=>e1.g.isLowerCaseMatch(t.connectorId,e.id))}};oN=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a}([(0,p.Mo)("w3m-connecting-external-view")],oN);var oj=(0,i.iv)`
  wui-flex,
  wui-list-wallet {
    width: 100%;
  }
`,oP=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let oB=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.activeConnector=X.ConnectorController.state.activeConnector,this.unsubscribe.push(X.ConnectorController.subscribeKey("activeConnector",e=>this.activeConnector=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return(0,i.dy)`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["3","5","5","5"]}
        gap="5"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-wallet-image
            size="lg"
            imageSrc=${(0,r.o)(c.f.getConnectorImage(this.activeConnector))}
          ></wui-wallet-image>
        </wui-flex>
        <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${["0","3","0","3"]}
        >
          <wui-text variant="lg-medium" color="primary">
            Select Chain for ${this.activeConnector?.name}
          </wui-text>
          <wui-text align="center" variant="lg-regular" color="secondary"
            >Select which chain to connect to your multi chain wallet</wui-text
          >
        </wui-flex>
        <wui-flex
          flexGrow="1"
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${["2","0","2","0"]}
        >
          ${this.networksTemplate()}
        </wui-flex>
      </wui-flex>
    `}networksTemplate(){return this.activeConnector?.connectors?.map(e=>e.name?i.dy`
            <w3m-list-wallet
              imageSrc=${r.o(c.f.getChainImage(e.chain))}
              name=${G.b.CHAIN_NAME_MAP[e.chain]}
              @click=${()=>this.onConnector(e)}
              size="sm"
              data-testid="wui-list-chain-${e.chain}"
              rdnsId=${e.explorerWallet?.rdns}
            ></w3m-list-wallet>
          `:null)}onConnector(e){let t=this.activeConnector?.connectors?.find(t=>t.chain===e.chain);if(!t){Z.SnackController.showError("Failed to find connector");return}"walletConnect"===t.id?u.j.isMobile()?Q.RouterController.push("AllWallets"):Q.RouterController.push("ConnectingWalletConnect"):Q.RouterController.push("ConnectingExternal",{connector:t,wallet:this.activeConnector?.explorerWallet})}};oB.styles=oj,oP([(0,n.SB)()],oB.prototype,"activeConnector",void 0),oB=oP([(0,p.Mo)("w3m-connecting-multi-chain-view")],oB);var oD=o(26149),oW=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let oL=class extends i.oi{constructor(){super(...arguments),this.platformTabs=[],this.unsubscribe=[],this.platforms=[],this.onSelectPlatfrom=void 0}disconnectCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.generateTabs();return(0,i.dy)`
      <wui-flex justifyContent="center" .padding=${["0","0","4","0"]}>
        <wui-tabs .tabs=${e} .onTabChange=${this.onTabChange.bind(this)}></wui-tabs>
      </wui-flex>
    `}generateTabs(){let e=this.platforms.map(e=>"browser"===e?{label:"Browser",icon:"extension",platform:"browser"}:"mobile"===e?{label:"Mobile",icon:"mobile",platform:"mobile"}:"qrcode"===e?{label:"Mobile",icon:"mobile",platform:"qrcode"}:"web"===e?{label:"Webapp",icon:"browser",platform:"web"}:"desktop"===e?{label:"Desktop",icon:"desktop",platform:"desktop"}:{label:"Browser",icon:"extension",platform:"unsupported"});return this.platformTabs=e.map(({platform:e})=>e),e}onTabChange(e){let t=this.platformTabs[e];t&&this.onSelectPlatfrom?.(t)}};oW([(0,n.Cb)({type:Array})],oL.prototype,"platforms",void 0),oW([(0,n.Cb)()],oL.prototype,"onSelectPlatfrom",void 0),oL=oW([(0,p.Mo)("w3m-connecting-header")],oL);let oM=class extends oO{constructor(){if(super(),!this.wallet)throw Error("w3m-connecting-wc-browser: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onAutoConnect=this.onConnectProxy.bind(this),W.X.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser",displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:Q.RouterController.state.view}})}async onConnectProxy(){try{this.error=!1;let{connectors:e}=X.ConnectorController.state,t=e.find(e=>"ANNOUNCED"===e.type&&e.info?.rdns===this.wallet?.rdns||"INJECTED"===e.type||e.name===this.wallet?.name);if(t)await ee.ConnectionController.connectExternal(t,t.chain);else throw Error("w3m-connecting-wc-browser: No connector found");h.I.close(),W.X.sendEvent({type:"track",event:"CONNECT_SUCCESS",properties:{method:"browser",name:this.wallet?.name||"Unknown",view:Q.RouterController.state.view,walletRank:this.wallet?.order}})}catch(e){e instanceof ov.g&&e.originalName===oC.jD.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?W.X.sendEvent({type:"track",event:"USER_REJECTED",properties:{message:e.message}}):W.X.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:e?.message??"Unknown"}}),this.error=!0}}};oM=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a}([(0,p.Mo)("w3m-connecting-wc-browser")],oM);let o_=class extends oO{constructor(){if(super(),!this.wallet)throw Error("w3m-connecting-wc-desktop: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onRender=this.onRenderProxy.bind(this),W.X.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"desktop",displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:Q.RouterController.state.view}})}onRenderProxy(){!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onConnectProxy(){if(this.wallet?.desktop_link&&this.uri)try{this.error=!1;let{desktop_link:e,name:t}=this.wallet,{redirect:o,href:i}=u.j.formatNativeUrl(e,this.uri);ee.ConnectionController.setWcLinking({name:t,href:i}),ee.ConnectionController.setRecentWallet(this.wallet),u.j.openHref(o,"_blank")}catch{this.error=!0}}};o_=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a}([(0,p.Mo)("w3m-connecting-wc-desktop")],o_);var oz=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let oU=class extends oO{constructor(){if(super(),this.btnLabelTimeout=void 0,this.redirectDeeplink=void 0,this.redirectUniversalLink=void 0,this.target=void 0,this.preferUniversalLinks=a.OptionsController.state.experimental_preferUniversalLinks,this.isLoading=!0,this.onConnect=()=>{if(this.wallet?.mobile_link&&this.uri)try{this.error=!1;let{mobile_link:e,link_mode:t,name:o}=this.wallet,{redirect:i,redirectUniversalLink:n,href:r}=u.j.formatNativeUrl(e,this.uri,t);this.redirectDeeplink=i,this.redirectUniversalLink=n,this.target=u.j.isIframe()?"_top":"_self",ee.ConnectionController.setWcLinking({name:o,href:r}),ee.ConnectionController.setRecentWallet(this.wallet),this.preferUniversalLinks&&this.redirectUniversalLink?u.j.openHref(this.redirectUniversalLink,this.target):u.j.openHref(this.redirectDeeplink,this.target)}catch(e){W.X.sendEvent({type:"track",event:"CONNECT_PROXY_ERROR",properties:{message:e instanceof Error?e.message:"Error parsing the deeplink",uri:this.uri,mobile_link:this.wallet.mobile_link,name:this.wallet.name}}),this.error=!0}},!this.wallet)throw Error("w3m-connecting-wc-mobile: No wallet provided");this.secondaryBtnLabel="Open",this.secondaryLabel=Y.bq.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.onHandleURI(),this.unsubscribe.push(ee.ConnectionController.subscribeKey("wcUri",()=>{this.onHandleURI()})),W.X.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"mobile",displayIndex:this.wallet?.display_index,walletRank:this.wallet.order,view:Q.RouterController.state.view}})}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.btnLabelTimeout)}onHandleURI(){this.isLoading=!this.uri,!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onTryAgain(){ee.ConnectionController.setWcError(!1),this.onConnect?.()}};oz([(0,n.SB)()],oU.prototype,"redirectDeeplink",void 0),oz([(0,n.SB)()],oU.prototype,"redirectUniversalLink",void 0),oz([(0,n.SB)()],oU.prototype,"target",void 0),oz([(0,n.SB)()],oU.prototype,"preferUniversalLinks",void 0),oz([(0,n.SB)()],oU.prototype,"isLoading",void 0),oU=oz([(0,p.Mo)("w3m-connecting-wc-mobile")],oU),o(18370);var oF=(0,p.iv)`
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

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`,oV=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let oH=class extends oO{constructor(){super(),this.basic=!1,this.forceUpdate=()=>{this.requestUpdate()},window.addEventListener("resize",this.forceUpdate)}firstUpdated(){this.basic||W.X.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet?.name??"WalletConnect",platform:"qrcode",displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:Q.RouterController.state.view}})}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.forEach(e=>e()),window.removeEventListener("resize",this.forceUpdate)}render(){return this.onRenderProxy(),(0,i.dy)`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["0","5","5","5"]}
        gap="5"
      >
        <wui-shimmer width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>
        <wui-text variant="lg-medium" color="primary"> Scan this QR Code with your phone </wui-text>
        ${this.copyTemplate()}
      </wui-flex>
      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}onRenderProxy(){!this.ready&&this.uri&&(this.timeout=setTimeout(()=>{this.ready=!0},200))}qrCodeTemplate(){if(!this.uri||!this.ready)return null;let e=this.getBoundingClientRect().width-40,t=this.wallet?this.wallet.name:void 0;ee.ConnectionController.setWcLinking(void 0),ee.ConnectionController.setRecentWallet(this.wallet);let o=this.uri;if(this.wallet?.mobile_link){let{redirect:e}=u.j.formatNativeUrl(this.wallet?.mobile_link,this.uri,null);o=e}return(0,i.dy)` <wui-qr-code
      size=${e}
      theme=${ox.ThemeController.state.themeMode}
      uri=${o}
      imageSrc=${(0,r.o)(c.f.getWalletImage(this.wallet))}
      color=${(0,r.o)(ox.ThemeController.state.themeVariables["--w3m-qr-color"])}
      alt=${(0,r.o)(t)}
      data-testid="wui-qr-code"
    ></wui-qr-code>`}copyTemplate(){let e=!this.uri||!this.ready;return(0,i.dy)`<wui-button
      .disabled=${e}
      @click=${this.onCopyUri}
      variant="neutral-secondary"
      size="sm"
      data-testid="copy-wc2-uri"
    >
      Copy link
      <wui-icon size="sm" color="inherit" name="copy" slot="iconRight"></wui-icon>
    </wui-button>`}};oH.styles=oF,oV([(0,n.Cb)({type:Boolean})],oH.prototype,"basic",void 0),oH=oV([(0,p.Mo)("w3m-connecting-wc-qrcode")],oH);let oK=class extends i.oi{constructor(){if(super(),this.wallet=Q.RouterController.state.data?.wallet,!this.wallet)throw Error("w3m-connecting-wc-unsupported: No wallet provided");W.X.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser",displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:Q.RouterController.state.view}})}render(){return(0,i.dy)`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","5","5"]}
        gap="5"
      >
        <wui-wallet-image
          size="lg"
          imageSrc=${(0,r.o)(c.f.getWalletImage(this.wallet))}
        ></wui-wallet-image>

        <wui-text variant="md-regular" color="primary">Not Detected</wui-text>
      </wui-flex>

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}};oK=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a}([(0,p.Mo)("w3m-connecting-wc-unsupported")],oK);var oq=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let oG=class extends oO{constructor(){if(super(),this.isLoading=!0,!this.wallet)throw Error("w3m-connecting-wc-web: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.secondaryBtnLabel="Open",this.secondaryLabel=Y.bq.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.updateLoadingState(),this.unsubscribe.push(ee.ConnectionController.subscribeKey("wcUri",()=>{this.updateLoadingState()})),W.X.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"web",displayIndex:this.wallet?.display_index,walletRank:this.wallet?.order,view:Q.RouterController.state.view}})}updateLoadingState(){this.isLoading=!this.uri}onConnectProxy(){if(this.wallet?.webapp_link&&this.uri)try{this.error=!1;let{webapp_link:e,name:t}=this.wallet,{redirect:o,href:i}=u.j.formatUniversalUrl(e,this.uri);ee.ConnectionController.setWcLinking({name:t,href:i}),ee.ConnectionController.setRecentWallet(this.wallet),u.j.openHref(o,"_blank")}catch{this.error=!0}}};oq([(0,n.SB)()],oG.prototype,"isLoading",void 0),oG=oq([(0,p.Mo)("w3m-connecting-wc-web")],oG);var oX=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let oY=class extends i.oi{constructor(){super(),this.wallet=Q.RouterController.state.data?.wallet,this.unsubscribe=[],this.platform=void 0,this.platforms=[],this.isSiwxEnabled=!!a.OptionsController.state.siwx,this.remoteFeatures=a.OptionsController.state.remoteFeatures,this.displayBranding=!0,this.basic=!1,this.determinePlatforms(),this.initializeConnection(),this.unsubscribe.push(a.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return(0,i.dy)`
      ${this.headerTemplate()}
      <div>${this.platformTemplate()}</div>
      ${this.reownBrandingTemplate()}
    `}reownBrandingTemplate(){return this.remoteFeatures?.reownBranding&&this.displayBranding?(0,i.dy)`<wui-ux-by-reown></wui-ux-by-reown>`:null}async initializeConnection(e=!1){if("browser"!==this.platform&&(!a.OptionsController.state.manualWCControl||e))try{let{wcPairingExpiry:t,status:o}=ee.ConnectionController.state;if(e||a.OptionsController.state.enableEmbedded||u.j.isPairingExpired(t)||"connecting"===o){let e=ee.ConnectionController.getConnections(s.R.state.activeChain),t=this.remoteFeatures?.multiWallet,o=e.length>0;await ee.ConnectionController.connectWalletConnect({cache:"never"}),this.isSiwxEnabled||(o&&t?(Q.RouterController.replace("ProfileWallets"),Z.SnackController.showSuccess("New Wallet Added")):h.I.close())}}catch(e){if(e instanceof Error&&e.message.includes("An error occurred when attempting to switch chain")&&!a.OptionsController.state.enableNetworkSwitch&&s.R.state.activeChain){s.R.setActiveCaipNetwork(oD.f.getUnsupportedNetwork(`${s.R.state.activeChain}:${s.R.state.activeCaipNetwork?.id}`)),s.R.showUnsupportedChainUI();return}e instanceof ov.g&&e.originalName===oC.jD.PROVIDER_RPC_ERROR_NAME.USER_REJECTED_REQUEST?W.X.sendEvent({type:"track",event:"USER_REJECTED",properties:{message:e.message}}):W.X.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:e?.message??"Unknown"}}),ee.ConnectionController.setWcError(!0),Z.SnackController.showError(e.message??"Connection error"),ee.ConnectionController.resetWcConnection(),Q.RouterController.goBack()}}determinePlatforms(){if(!this.wallet){this.platforms.push("qrcode"),this.platform="qrcode";return}if(this.platform)return;let{mobile_link:e,desktop_link:t,webapp_link:o,injected:i,rdns:n}=this.wallet,r=i?.map(({injected_id:e})=>e).filter(Boolean),l=[...n?[n]:r??[]],c=!a.OptionsController.state.isUniversalProvider&&l.length,d=ee.ConnectionController.checkInstalled(l),h=c&&d,p=t&&!u.j.isMobile();h&&!s.R.state.noAdapters&&this.platforms.push("browser"),e&&this.platforms.push(u.j.isMobile()?"mobile":"qrcode"),o&&this.platforms.push("web"),p&&this.platforms.push("desktop"),h||!c||s.R.state.noAdapters||this.platforms.push("unsupported"),this.platform=this.platforms[0]}platformTemplate(){switch(this.platform){case"browser":return(0,i.dy)`<w3m-connecting-wc-browser></w3m-connecting-wc-browser>`;case"web":return(0,i.dy)`<w3m-connecting-wc-web></w3m-connecting-wc-web>`;case"desktop":return(0,i.dy)`
          <w3m-connecting-wc-desktop .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-desktop>
        `;case"mobile":return(0,i.dy)`
          <w3m-connecting-wc-mobile isMobile .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-mobile>
        `;case"qrcode":return(0,i.dy)`<w3m-connecting-wc-qrcode ?basic=${this.basic}></w3m-connecting-wc-qrcode>`;default:return(0,i.dy)`<w3m-connecting-wc-unsupported></w3m-connecting-wc-unsupported>`}}headerTemplate(){return this.platforms.length>1?(0,i.dy)`
      <w3m-connecting-header
        .platforms=${this.platforms}
        .onSelectPlatfrom=${this.onSelectPlatform.bind(this)}
      >
      </w3m-connecting-header>
    `:null}async onSelectPlatform(e){let t=this.shadowRoot?.querySelector("div");t&&(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.platform=e,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}};oX([(0,n.SB)()],oY.prototype,"platform",void 0),oX([(0,n.SB)()],oY.prototype,"platforms",void 0),oX([(0,n.SB)()],oY.prototype,"isSiwxEnabled",void 0),oX([(0,n.SB)()],oY.prototype,"remoteFeatures",void 0),oX([(0,n.Cb)({type:Boolean})],oY.prototype,"displayBranding",void 0),oX([(0,n.Cb)({type:Boolean})],oY.prototype,"basic",void 0),oY=oX([(0,p.Mo)("w3m-connecting-wc-view")],oY);var oZ=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let oJ=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.isMobile=u.j.isMobile(),this.remoteFeatures=a.OptionsController.state.remoteFeatures,this.unsubscribe.push(a.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(this.isMobile){let{featured:e,recommended:t}=tu.ApiController.state,{customWallets:o}=a.OptionsController.state,n=ea.M.getRecentWallets(),r=e.length||t.length||o?.length||n.length;return(0,i.dy)`<wui-flex flexDirection="column" gap="2" .margin=${["1","3","3","3"]}>
        ${r?(0,i.dy)`<w3m-connector-list></w3m-connector-list>`:null}
        <w3m-all-wallets-widget></w3m-all-wallets-widget>
      </wui-flex>`}return(0,i.dy)`<wui-flex flexDirection="column" .padding=${["0","0","4","0"]}>
        <w3m-connecting-wc-view ?basic=${!0} .displayBranding=${!1}></w3m-connecting-wc-view>
        <wui-flex flexDirection="column" .padding=${["0","3","0","3"]}>
          <w3m-all-wallets-widget></w3m-all-wallets-widget>
        </wui-flex>
      </wui-flex>
      ${this.reownBrandingTemplate()} `}reownBrandingTemplate(){return this.remoteFeatures?.reownBranding?(0,i.dy)` <wui-flex flexDirection="column" .padding=${["1","0","1","0"]}>
      <wui-ux-by-reown></wui-ux-by-reown>
    </wui-flex>`:null}};oZ([(0,n.SB)()],oJ.prototype,"isMobile",void 0),oZ([(0,n.SB)()],oJ.prototype,"remoteFeatures",void 0),oJ=oZ([(0,p.Mo)("w3m-connecting-wc-basic-view")],oJ);var oQ=o(63735),o0=(0,i.iv)`
  .continue-button-container {
    width: 100%;
  }
`,o3=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let o1=class extends i.oi{constructor(){super(...arguments),this.loading=!1}render(){return(0,i.dy)`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="6"
        .padding=${["0","0","4","0"]}
      >
        ${this.onboardingTemplate()} ${this.buttonsTemplate()}
        <wui-link
          @click=${()=>{u.j.openHref(oQ.U.URLS.FAQ,"_blank")}}
        >
          Learn more about names
          <wui-icon color="inherit" slot="iconRight" name="externalLink"></wui-icon>
        </wui-link>
      </wui-flex>
    `}onboardingTemplate(){return(0,i.dy)` <wui-flex
      flexDirection="column"
      gap="6"
      alignItems="center"
      .padding=${["0","6","0","6"]}
    >
      <wui-flex gap="3" alignItems="center" justifyContent="center">
        <wui-icon-box icon="id" size="xl" iconSize="xxl" color="default"></wui-icon-box>
      </wui-flex>
      <wui-flex flexDirection="column" alignItems="center" gap="3">
        <wui-text align="center" variant="lg-medium" color="primary">
          Choose your account name
        </wui-text>
        <wui-text align="center" variant="md-regular" color="primary">
          Finally say goodbye to 0x addresses, name your account to make it easier to exchange
          assets
        </wui-text>
      </wui-flex>
    </wui-flex>`}buttonsTemplate(){return(0,i.dy)`<wui-flex
      .padding=${["0","8","0","8"]}
      gap="3"
      class="continue-button-container"
    >
      <wui-button
        fullWidth
        .loading=${this.loading}
        size="lg"
        borderRadius="xs"
        @click=${this.handleContinue.bind(this)}
        >Choose name
      </wui-button>
    </wui-flex>`}handleContinue(){Q.RouterController.push("RegisterAccountName"),W.X.sendEvent({type:"track",event:"OPEN_ENS_FLOW",properties:{isSmartAccount:(0,J.r9)(s.R.state.activeChain)===er.y_.ACCOUNT_TYPES.SMART_ACCOUNT}})}};o1.styles=o0,o3([(0,n.SB)()],o1.prototype,"loading",void 0),o1=o3([(0,p.Mo)("w3m-choose-account-name-view")],o1);let o2=class extends i.oi{constructor(){super(...arguments),this.wallet=Q.RouterController.state.data?.wallet}render(){if(!this.wallet)throw Error("w3m-downloads-view");return(0,i.dy)`
      <wui-flex gap="2" flexDirection="column" .padding=${["3","3","4","3"]}>
        ${this.chromeTemplate()} ${this.iosTemplate()} ${this.androidTemplate()}
        ${this.homepageTemplate()}
      </wui-flex>
    `}chromeTemplate(){return this.wallet?.chrome_store?(0,i.dy)`<wui-list-item
      variant="icon"
      icon="chromeStore"
      iconVariant="square"
      @click=${this.onChromeStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">Chrome Extension</wui-text>
    </wui-list-item>`:null}iosTemplate(){return this.wallet?.app_store?(0,i.dy)`<wui-list-item
      variant="icon"
      icon="appStore"
      iconVariant="square"
      @click=${this.onAppStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">iOS App</wui-text>
    </wui-list-item>`:null}androidTemplate(){return this.wallet?.play_store?(0,i.dy)`<wui-list-item
      variant="icon"
      icon="playStore"
      iconVariant="square"
      @click=${this.onPlayStore.bind(this)}
      chevron
    >
      <wui-text variant="md-medium" color="primary">Android App</wui-text>
    </wui-list-item>`:null}homepageTemplate(){return this.wallet?.homepage?(0,i.dy)`
      <wui-list-item
        variant="icon"
        icon="browser"
        iconVariant="square-blue"
        @click=${this.onHomePage.bind(this)}
        chevron
      >
        <wui-text variant="md-medium" color="primary">Website</wui-text>
      </wui-list-item>
    `:null}openStore(e){e.href&&this.wallet&&(W.X.sendEvent({type:"track",event:"GET_WALLET",properties:{name:this.wallet.name,walletRank:this.wallet.order,explorerId:this.wallet.id,type:e.type}}),u.j.openHref(e.href,"_blank"))}onChromeStore(){this.wallet?.chrome_store&&this.openStore({href:this.wallet.chrome_store,type:"chrome_store"})}onAppStore(){this.wallet?.app_store&&this.openStore({href:this.wallet.app_store,type:"app_store"})}onPlayStore(){this.wallet?.play_store&&this.openStore({href:this.wallet.play_store,type:"play_store"})}onHomePage(){this.wallet?.homepage&&this.openStore({href:this.wallet.homepage,type:"homepage"})}};o2=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a}([(0,p.Mo)("w3m-downloads-view")],o2);let o5=class extends i.oi{render(){return(0,i.dy)`
      <wui-flex flexDirection="column" .padding=${["0","3","3","3"]} gap="2">
        ${this.recommendedWalletsTemplate()}
        <w3m-list-wallet
          name="Explore all"
          showAllWallets
          walletIcon="allWallets"
          icon="externalLink"
          size="sm"
          @click=${()=>{u.j.openHref("https://walletconnect.com/explorer?type=wallet","_blank")}}
        ></w3m-list-wallet>
      </wui-flex>
    `}recommendedWalletsTemplate(){let{recommended:e,featured:t}=tu.ApiController.state,{customWallets:o}=a.OptionsController.state;return[...t,...o??[],...e].slice(0,4).map(e=>(0,i.dy)`
        <w3m-list-wallet
          name=${e.name??"Unknown"}
          tagVariant="accent"
          size="sm"
          imageSrc=${(0,r.o)(c.f.getWalletImage(e))}
          @click=${()=>{this.onWalletClick(e)}}
        ></w3m-list-wallet>
      `)}onWalletClick(e){W.X.sendEvent({type:"track",event:"GET_WALLET",properties:{name:e.name,walletRank:void 0,explorerId:e.id,type:"homepage"}}),u.j.openHref(e.homepage??"https://walletconnect.com/explorer","_blank")}};o5=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a}([(0,p.Mo)("w3m-get-wallet-view")],o5),o(40256);var o6=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let o4=class extends i.oi{constructor(){super(...arguments),this.data=[]}render(){return(0,i.dy)`
      <wui-flex flexDirection="column" alignItems="center" gap="4">
        ${this.data.map(e=>(0,i.dy)`
            <wui-flex flexDirection="column" alignItems="center" gap="5">
              <wui-flex flexDirection="row" justifyContent="center" gap="1">
                ${e.images.map(e=>(0,i.dy)`<wui-visual size="sm" name=${e}></wui-visual>`)}
              </wui-flex>
            </wui-flex>
            <wui-flex flexDirection="column" alignItems="center" gap="1">
              <wui-text variant="md-regular" color="primary" align="center">${e.title}</wui-text>
              <wui-text variant="sm-regular" color="secondary" align="center"
                >${e.text}</wui-text
              >
            </wui-flex>
          `)}
      </wui-flex>
    `}};o6([(0,n.Cb)({type:Array})],o4.prototype,"data",void 0),o4=o6([(0,p.Mo)("w3m-help-widget")],o4);let o8=[{images:["login","profile","lock"],title:"One login for all of web3",text:"Log in to any app by connecting your wallet. Say goodbye to countless passwords!"},{images:["defi","nft","eth"],title:"A home for your digital assets",text:"A wallet lets you store, send and receive digital assets like cryptocurrencies and NFTs."},{images:["browser","noun","dao"],title:"Your gateway to a new web",text:"With your wallet, you can explore and interact with DeFi, NFTs, DAOs, and much more."}],o7=class extends i.oi{render(){return(0,i.dy)`
      <wui-flex
        flexDirection="column"
        .padding=${["6","5","5","5"]}
        alignItems="center"
        gap="5"
      >
        <w3m-help-widget .data=${o8}></w3m-help-widget>
        <wui-button variant="accent-primary" size="md" @click=${this.onGetWallet.bind(this)}>
          <wui-icon color="inherit" slot="iconLeft" name="wallet"></wui-icon>
          Get a wallet
        </wui-button>
      </wui-flex>
    `}onGetWallet(){W.X.sendEvent({type:"track",event:"CLICK_GET_WALLET_HELP"}),Q.RouterController.push("GetWallet")}};o7=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a}([(0,p.Mo)("w3m-what-is-a-wallet-view")],o7);var o9=(0,p.iv)`
  wui-flex {
    max-height: clamp(360px, 540px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    transition: opacity ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
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
`,ie=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let it=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.checked=tj.M.state.isLegalCheckboxChecked,this.unsubscribe.push(tj.M.subscribeKey("isLegalCheckboxChecked",e=>{this.checked=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=a.OptionsController.state,o=a.OptionsController.state.features?.legalCheckbox,n=!!(e||t)&&!!o,s=n&&!this.checked;return(0,i.dy)`
      <w3m-legal-checkbox></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${n?["0","3","3","3"]:"3"}
        gap="2"
        class=${(0,r.o)(s?"disabled":void 0)}
      >
        <w3m-wallet-login-list tabIdx=${(0,r.o)(s?-1:void 0)}></w3m-wallet-login-list>
      </wui-flex>
    `}};it.styles=o9,ie([(0,n.SB)()],it.prototype,"checked",void 0),it=ie([(0,p.Mo)("w3m-connect-wallets-view")],it);var io=(0,g.iv)`
  :host {
    display: block;
    width: 120px;
    height: 120px;
  }

  svg {
    width: 120px;
    height: 120px;
    fill: none;
    stroke: transparent;
    stroke-linecap: round;
  }

  use {
    stroke: ${e=>e.colors.accent100};
    stroke-width: 2px;
    stroke-dasharray: 54, 118;
    stroke-dashoffset: 172;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: 0px;
    }
  }
`;let ii=class extends i.oi{render(){return(0,i.dy)`
      <svg viewBox="0 0 54 59">
        <path
          id="wui-loader-path"
          d="M17.22 5.295c3.877-2.277 5.737-3.363 7.72-3.726a11.44 11.44 0 0 1 4.12 0c1.983.363 3.844 1.45 7.72 3.726l6.065 3.562c3.876 2.276 5.731 3.372 7.032 4.938a11.896 11.896 0 0 1 2.06 3.63c.683 1.928.688 4.11.688 8.663v7.124c0 4.553-.005 6.735-.688 8.664a11.896 11.896 0 0 1-2.06 3.63c-1.3 1.565-3.156 2.66-7.032 4.937l-6.065 3.563c-3.877 2.276-5.737 3.362-7.72 3.725a11.46 11.46 0 0 1-4.12 0c-1.983-.363-3.844-1.449-7.72-3.726l-6.065-3.562c-3.876-2.276-5.731-3.372-7.032-4.938a11.885 11.885 0 0 1-2.06-3.63c-.682-1.928-.688-4.11-.688-8.663v-7.124c0-4.553.006-6.735.688-8.664a11.885 11.885 0 0 1 2.06-3.63c1.3-1.565 3.156-2.66 7.032-4.937l6.065-3.562Z"
        />
        <use xlink:href="#wui-loader-path"></use>
      </svg>
    `}};ii.styles=[w.ET,io],ii=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a}([(0,m.M)("wui-loading-hexagon")],ii),o(48808);var ir=(0,i.iv)`
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

  wui-loading-hexagon {
    position: absolute;
  }

  wui-icon-box {
    position: absolute;
    right: 4px;
    bottom: 0;
    opacity: 0;
    transform: scale(0.5);
    z-index: 1;
  }

  wui-button {
    display: none;
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  wui-button[data-retry='true'] {
    display: block;
    opacity: 1;
  }
`,ia=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let is=class extends i.oi{constructor(){super(),this.network=Q.RouterController.state.data?.network,this.unsubscribe=[],this.showRetry=!1,this.error=!1}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}firstUpdated(){this.onSwitchNetwork()}render(){if(!this.network)throw Error("w3m-network-switch-view: No network provided");this.onShowRetry();let e=this.getLabel(),t=this.getSubLabel();return(0,i.dy)`
      <wui-flex
        data-error=${this.error}
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","10","5"]}
        gap="7"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-network-image
            size="lg"
            imageSrc=${(0,r.o)(c.f.getNetworkImage(this.network))}
          ></wui-network-image>

          ${this.error?null:(0,i.dy)`<wui-loading-hexagon></wui-loading-hexagon>`}

          <wui-icon-box color="error" icon="close" size="sm"></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="h6-regular" color="primary">${e}</wui-text>
          <wui-text align="center" variant="md-regular" color="secondary">${t}</wui-text>
        </wui-flex>

        <wui-button
          data-retry=${this.showRetry}
          variant="accent-primary"
          size="md"
          .disabled=${!this.error}
          @click=${this.onSwitchNetwork.bind(this)}
        >
          <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
          Try again
        </wui-button>
      </wui-flex>
    `}getSubLabel(){let e=X.ConnectorController.getConnectorId(s.R.state.activeChain);return X.ConnectorController.getAuthConnector()&&e===G.b.CONNECTOR_ID.AUTH?"":this.error?"Switch can be declined if chain is not supported by a wallet or previous request is still active":"Accept connection request in your wallet"}getLabel(){let e=X.ConnectorController.getConnectorId(s.R.state.activeChain);return X.ConnectorController.getAuthConnector()&&e===G.b.CONNECTOR_ID.AUTH?`Switching to ${this.network?.name??"Unknown"} network...`:this.error?"Switch declined":"Approve in wallet"}onShowRetry(){if(this.error&&!this.showRetry){this.showRetry=!0;let e=this.shadowRoot?.querySelector("wui-button");e?.animate([{opacity:0},{opacity:1}],{fill:"forwards",easing:"ease"})}}async onSwitchNetwork(){try{this.error=!1,s.R.state.activeChain!==this.network?.chainNamespace&&s.R.setIsSwitchingNamespace(!0),this.network&&await s.R.switchActiveNetwork(this.network)}catch(e){this.error=!0}}};is.styles=ir,ia([(0,n.SB)()],is.prototype,"showRetry",void 0),ia([(0,n.SB)()],is.prototype,"error",void 0),is=ia([(0,p.Mo)("w3m-network-switch-view")],is);var il=o(94293);o(43722);var ic=(0,g.iv)`
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
`,id=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let iu=class extends i.oi{constructor(){super(...arguments),this.imageSrc="ethereum",this.name="Ethereum",this.disabled=!1}render(){return(0,i.dy)`
      <button ?disabled=${this.disabled} tabindex=${(0,r.o)(this.tabIdx)}>
        <wui-flex gap="2" alignItems="center">
          <wui-image ?boxed=${!0} src=${this.imageSrc}></wui-image>
          <wui-text variant="lg-regular" color="primary">${this.name}</wui-text>
        </wui-flex>
        <wui-icon name="chevronRight" size="lg" color="default"></wui-icon>
      </button>
    `}};iu.styles=[w.ET,w.ZM,ic],id([(0,n.Cb)()],iu.prototype,"imageSrc",void 0),id([(0,n.Cb)()],iu.prototype,"name",void 0),id([(0,n.Cb)()],iu.prototype,"tabIdx",void 0),id([(0,n.Cb)({type:Boolean})],iu.prototype,"disabled",void 0),iu=id([(0,m.M)("wui-list-network")],iu);var ih=(0,i.iv)`
  .container {
    max-height: 360px;
    overflow: auto;
  }

  .container::-webkit-scrollbar {
    display: none;
  }
`,ip=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let iw=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.network=s.R.state.activeCaipNetwork,this.requestedCaipNetworks=s.R.getCaipNetworks(),this.search="",this.onDebouncedSearch=u.j.debounce(e=>{this.search=e},100),this.unsubscribe.push(l.W.subscribeNetworkImages(()=>this.requestUpdate()),s.R.subscribeKey("activeCaipNetwork",e=>this.network=e),s.R.subscribe(()=>{this.requestedCaipNetworks=s.R.getAllRequestedCaipNetworks()}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return(0,i.dy)`
      ${this.templateSearchInput()}
      <wui-flex
        class="container"
        .padding=${["0","3","3","3"]}
        flexDirection="column"
        gap="2"
      >
        ${this.networksTemplate()}
      </wui-flex>
    `}templateSearchInput(){return(0,i.dy)`
      <wui-flex gap="2" .padding=${["0","3","3","3"]}>
        <wui-input-text
          @inputChange=${this.onInputChange.bind(this)}
          class="network-search-input"
          size="md"
          placeholder="Search network"
          icon="search"
        ></wui-input-text>
      </wui-flex>
    `}onInputChange(e){this.onDebouncedSearch(e.detail)}networksTemplate(){let e=s.R.getAllApprovedCaipNetworkIds(),t=u.j.sortRequestedNetworks(e,this.requestedCaipNetworks);return this.search?this.filteredNetworks=t?.filter(e=>e?.name?.toLowerCase().includes(this.search.toLowerCase())):this.filteredNetworks=t,this.filteredNetworks?.map(e=>i.dy`
        <wui-list-network
          .selected=${this.network?.id===e.id}
          imageSrc=${r.o(c.f.getNetworkImage(e))}
          type="network"
          name=${e.name??e.id}
          @click=${()=>this.onSwitchNetwork(e)}
          .disabled=${this.getNetworkDisabled(e)}
          data-testid=${`w3m-network-switch-${e.name??e.id}`}
        ></wui-list-network>
      `)}getNetworkDisabled(e){let t=e.chainNamespace,o=d.AccountController.getCaipAddress(t),i=s.R.getAllApprovedCaipNetworkIds(),n=!1!==s.R.getNetworkProp("supportsAllNetworks",t),r=X.ConnectorController.getConnectorId(t),a=X.ConnectorController.getAuthConnector(),l=r===G.b.CONNECTOR_ID.AUTH&&a;return!!o&&!n&&!l&&!i?.includes(e.caipNetworkId)}onSwitchNetwork(e){il.p.onSwitchNetwork({network:e})}};iw.styles=ih,ip([(0,n.SB)()],iw.prototype,"network",void 0),ip([(0,n.SB)()],iw.prototype,"requestedCaipNetworks",void 0),ip([(0,n.SB)()],iw.prototype,"filteredNetworks",void 0),ip([(0,n.SB)()],iw.prototype,"search",void 0),iw=ip([(0,p.Mo)("w3m-networks-view")],iw);var ib=(0,p.iv)`
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

  wui-visual {
    border-radius: calc(
      ${({borderRadius:e})=>e["1"]} * 9 - ${({borderRadius:e})=>e["3"]}
    );
    position: relative;
    overflow: hidden;
  }

  wui-visual::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    border-radius: calc(
      ${({borderRadius:e})=>e["1"]} * 9 - ${({borderRadius:e})=>e["3"]}
    );
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.core.glass010};
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

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }

  wui-link {
    padding: ${({spacing:e})=>e["01"]} ${({spacing:e})=>e["2"]};
  }

  .capitalize {
    text-transform: capitalize;
  }
`,im=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let ig={eip155:"eth",solana:"solana",bip122:"bitcoin",polkadot:void 0},iy=class extends i.oi{constructor(){super(...arguments),this.unsubscribe=[],this.switchToChain=Q.RouterController.state.data?.switchToChain,this.caipNetwork=Q.RouterController.state.data?.network,this.activeChain=s.R.state.activeChain}firstUpdated(){this.unsubscribe.push(s.R.subscribeKey("activeChain",e=>this.activeChain=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.switchToChain?G.b.CHAIN_NAME_MAP[this.switchToChain]:"supported";if(!this.switchToChain)return null;let t=G.b.CHAIN_NAME_MAP[this.switchToChain];return(0,i.dy)`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["4","2","2","2"]}
        gap="4"
      >
        <wui-flex justifyContent="center" flexDirection="column" alignItems="center" gap="2">
          <wui-visual
            size="md"
            name=${(0,r.o)(ig[this.switchToChain])}
          ></wui-visual>
          <wui-flex gap="2" flexDirection="column">
            <wui-text
              data-testid=${`w3m-switch-active-chain-to-${t}`}
              variant="lg-regular"
              color="primary"
              align="center"
              >Switch to <span class="capitalize">${t}</span></wui-text
            >
            <wui-text variant="md-regular" color="secondary" align="center">
              Connected wallet doesn't support connecting to ${e} chain. You
              need to connect with a different wallet.
            </wui-text>
          </wui-flex>
          <wui-button
            data-testid="w3m-switch-active-chain-button"
            size="md"
            @click=${this.switchActiveChain.bind(this)}
            >Switch</wui-button
          >
        </wui-flex>
      </wui-flex>
    `}async switchActiveChain(){this.switchToChain&&(s.R.setIsSwitchingNamespace(!0),X.ConnectorController.setFilterByNamespace(this.switchToChain),this.caipNetwork?await s.R.switchActiveNetwork(this.caipNetwork):s.R.setActiveNamespace(this.switchToChain),Q.RouterController.reset("Connect"))}};iy.styles=ib,im([(0,n.Cb)()],iy.prototype,"activeChain",void 0),iy=im([(0,p.Mo)("w3m-switch-active-chain-view")],iy);let iC=[{images:["network","layers","system"],title:"The system’s nuts and bolts",text:"A network is what brings the blockchain to life, as this technical infrastructure allows apps to access the ledger and smart contract services."},{images:["noun","defiAlt","dao"],title:"Designed for different uses",text:"Each network is designed differently, and may therefore suit certain apps and experiences."}],iv=class extends i.oi{render(){return(0,i.dy)`
      <wui-flex
        flexDirection="column"
        .padding=${["6","5","5","5"]}
        alignItems="center"
        gap="5"
      >
        <w3m-help-widget .data=${iC}></w3m-help-widget>
        <wui-button
          variant="accent-primary"
          size="md"
          @click=${()=>{u.j.openHref("https://ethereum.org/en/developers/docs/networks/","_blank")}}
        >
          Learn more
          <wui-icon color="inherit" slot="iconRight" name="externalLink"></wui-icon>
        </wui-button>
      </wui-flex>
    `}};iv=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a}([(0,p.Mo)("w3m-what-is-a-network-view")],iv);var ix=(0,i.iv)`
  :host > wui-flex {
    max-height: clamp(360px, 540px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
  }

  :host > wui-flex::-webkit-scrollbar {
    display: none;
  }
`,i$=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let ik=class extends i.oi{constructor(){super(),this.swapUnsupportedChain=Q.RouterController.state.data?.swapUnsupportedChain,this.unsubscribe=[],this.disconnecting=!1,this.remoteFeatures=a.OptionsController.state.remoteFeatures,this.unsubscribe.push(l.W.subscribeNetworkImages(()=>this.requestUpdate()),a.OptionsController.subscribeKey("remoteFeatures",e=>{this.remoteFeatures=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return(0,i.dy)`
      <wui-flex class="container" flexDirection="column" gap="0">
        <wui-flex
          class="container"
          flexDirection="column"
          .padding=${["3","5","2","5"]}
          alignItems="center"
          gap="5"
        >
          ${this.descriptionTemplate()}
        </wui-flex>

        <wui-flex flexDirection="column" padding="3" gap="2"> ${this.networksTemplate()} </wui-flex>

        <wui-separator text="or"></wui-separator>
        <wui-flex flexDirection="column" padding="3" gap="2">
          <wui-list-item
            variant="icon"
            iconVariant="overlay"
            icon="signOut"
            ?chevron=${!1}
            .loading=${this.disconnecting}
            @click=${this.onDisconnect.bind(this)}
            data-testid="disconnect-button"
          >
            <wui-text variant="md-medium" color="secondary">Disconnect</wui-text>
          </wui-list-item>
        </wui-flex>
      </wui-flex>
    `}descriptionTemplate(){return this.swapUnsupportedChain?(0,i.dy)`
        <wui-text variant="sm-regular" color="secondary" align="center">
          The swap feature doesn’t support your current network. Switch to an available option to
          continue.
        </wui-text>
      `:(0,i.dy)`
      <wui-text variant="sm-regular" color="secondary" align="center">
        This app doesn’t support your current network. Switch to an available option to continue.
      </wui-text>
    `}networksTemplate(){let e=s.R.getAllRequestedCaipNetworks(),t=s.R.getAllApprovedCaipNetworkIds(),o=u.j.sortRequestedNetworks(t,e);return(this.swapUnsupportedChain?o.filter(e=>Y.bq.SWAP_SUPPORTED_NETWORKS.includes(e.caipNetworkId)):o).map(e=>(0,i.dy)`
        <wui-list-network
          imageSrc=${(0,r.o)(c.f.getNetworkImage(e))}
          name=${e.name??"Unknown"}
          @click=${()=>this.onSwitchNetwork(e)}
        >
        </wui-list-network>
      `)}async onDisconnect(){try{this.disconnecting=!0;let e=s.R.state.activeChain,t=ee.ConnectionController.getConnections(e).length>0,o=e&&X.ConnectorController.state.activeConnectorIds[e],i=this.remoteFeatures?.multiWallet;await ee.ConnectionController.disconnect(i?{id:o,namespace:e}:{}),t&&i&&(Q.RouterController.push("ProfileWallets"),Z.SnackController.showSuccess("Wallet deleted"))}catch{W.X.sendEvent({type:"track",event:"DISCONNECT_ERROR",properties:{message:"Failed to disconnect"}}),Z.SnackController.showError("Failed to disconnect")}finally{this.disconnecting=!1}}async onSwitchNetwork(e){let t=d.AccountController.state.caipAddress,o=s.R.getAllApprovedCaipNetworkIds(),i=(s.R.getNetworkProp("supportsAllNetworks",e.chainNamespace),Q.RouterController.state.data);t?o?.includes(e.caipNetworkId)?await s.R.switchActiveNetwork(e):Q.RouterController.push("SwitchNetwork",{...i,network:e}):t||(s.R.setActiveCaipNetwork(e),Q.RouterController.push("Connect"))}};ik.styles=ix,i$([(0,n.SB)()],ik.prototype,"disconnecting",void 0),i$([(0,n.SB)()],ik.prototype,"remoteFeatures",void 0),ik=i$([(0,p.Mo)("w3m-unsupported-chain-view")],ik);var iS=(0,g.iv)`
  wui-flex {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[4]};
    padding: ${({spacing:e})=>e[3]};
  }

  /* -- Types --------------------------------------------------------- */
  wui-flex[data-type='info'] {
    color: ${({tokens:e})=>e.theme.textSecondary};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  wui-flex[data-type='success'] {
    color: ${({tokens:e})=>e.core.textSuccess};
    background-color: ${({tokens:e})=>e.core.backgroundSuccess};
  }

  wui-flex[data-type='error'] {
    color: ${({tokens:e})=>e.core.textError};
    background-color: ${({tokens:e})=>e.core.backgroundError};
  }

  wui-flex[data-type='warning'] {
    color: ${({tokens:e})=>e.core.textWarning};
    background-color: ${({tokens:e})=>e.core.backgroundWarning};
  }

  wui-flex[data-type='info'] wui-icon-box {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  wui-flex[data-type='success'] wui-icon-box {
    background-color: ${({tokens:e})=>e.core.backgroundSuccess};
  }

  wui-flex[data-type='error'] wui-icon-box {
    background-color: ${({tokens:e})=>e.core.backgroundError};
  }

  wui-flex[data-type='warning'] wui-icon-box {
    background-color: ${({tokens:e})=>e.core.backgroundWarning};
  }

  wui-text {
    flex: 1;
  }
`,iR=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let iE=class extends i.oi{constructor(){super(...arguments),this.icon="externalLink",this.text="",this.type="info"}render(){return(0,i.dy)`
      <wui-flex alignItems="center" data-type=${this.type}>
        <wui-icon-box size="sm" color="inherit" icon=${this.icon}></wui-icon-box>
        <wui-text variant="md-regular" color="inherit">${this.text}</wui-text>
      </wui-flex>
    `}};iE.styles=[w.ET,w.ZM,iS],iR([(0,n.Cb)()],iE.prototype,"icon",void 0),iR([(0,n.Cb)()],iE.prototype,"text",void 0),iR([(0,n.Cb)()],iE.prototype,"type",void 0),iE=iR([(0,m.M)("wui-banner")],iE);var iA=(0,i.iv)`
  :host > wui-flex {
    max-height: clamp(360px, 540px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
  }

  :host > wui-flex::-webkit-scrollbar {
    display: none;
  }
`;let iI=class extends i.oi{constructor(){super(),this.unsubscribe=[]}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return(0,i.dy)` <wui-flex flexDirection="column" .padding=${["2","3","3","3"]} gap="2">
      <wui-banner
        icon="warningCircle"
        text="You can only receive assets on these networks"
      ></wui-banner>
      ${this.networkTemplate()}
    </wui-flex>`}networkTemplate(){let e=s.R.getAllRequestedCaipNetworks(),t=s.R.getAllApprovedCaipNetworkIds(),o=s.R.state.activeCaipNetwork,n=s.R.checkIfSmartAccountEnabled(),a=u.j.sortRequestedNetworks(t,e);if(n&&(0,J.r9)(o?.chainNamespace)===er.y_.ACCOUNT_TYPES.SMART_ACCOUNT){if(!o)return null;a=[o]}return a.filter(e=>e.chainNamespace===o?.chainNamespace).map(e=>(0,i.dy)`
        <wui-list-network
          imageSrc=${(0,r.o)(c.f.getNetworkImage(e))}
          name=${e.name??"Unknown"}
          ?transparent=${!0}
        >
        </wui-list-network>
      `)}};iI.styles=iA,iI=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a}([(0,p.Mo)("w3m-wallet-compatible-networks-view")],iI);var iT=o(85589),iO=(0,g.iv)`
  :host {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 56px;
    height: 56px;
    box-shadow: 0 0 0 8px ${({tokens:e})=>e.theme.borderPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
    overflow: hidden;
  }

  :host([data-border-radius-full='true']) {
    border-radius: 50px;
  }

  wui-icon {
    width: 32px;
    height: 32px;
  }
`,iN=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let ij=class extends i.oi{render(){return this.dataset.borderRadiusFull=this.borderRadiusFull?"true":"false",(0,i.dy)`${this.templateVisual()}`}templateVisual(){return this.imageSrc?(0,i.dy)`<wui-image src=${this.imageSrc} alt=${this.alt??""}></wui-image>`:(0,i.dy)`<wui-icon
      data-parent-size="md"
      size="inherit"
      color="inherit"
      name="wallet"
    ></wui-icon>`}};ij.styles=[w.ET,iO],iN([(0,n.Cb)()],ij.prototype,"imageSrc",void 0),iN([(0,n.Cb)()],ij.prototype,"alt",void 0),iN([(0,n.Cb)({type:Boolean})],ij.prototype,"borderRadiusFull",void 0),ij=iN([(0,m.M)("wui-visual-thumbnail")],ij);var iP=(0,p.iv)`
  :host {
    display: flex;
    justify-content: center;
    gap: ${({spacing:e})=>e["4"]};
  }

  wui-visual-thumbnail:nth-child(1) {
    z-index: 1;
  }
`;let iB=class extends i.oi{constructor(){super(...arguments),this.dappImageUrl=a.OptionsController.state.metadata?.icons,this.walletImageUrl=d.AccountController.state.connectedWalletInfo?.icon}firstUpdated(){let e=this.shadowRoot?.querySelectorAll("wui-visual-thumbnail");e?.[0]&&this.createAnimation(e[0],"translate(18px)"),e?.[1]&&this.createAnimation(e[1],"translate(-18px)")}render(){return(0,i.dy)`
      <wui-visual-thumbnail
        ?borderRadiusFull=${!0}
        .imageSrc=${this.dappImageUrl?.[0]}
      ></wui-visual-thumbnail>
      <wui-visual-thumbnail .imageSrc=${this.walletImageUrl}></wui-visual-thumbnail>
    `}createAnimation(e,t){e.animate([{transform:"translateX(0px)"},{transform:t}],{duration:1600,easing:"cubic-bezier(0.56, 0, 0.48, 1)",direction:"alternate",iterations:1/0})}};iB.styles=iP,iB=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a}([(0,p.Mo)("w3m-siwx-sign-message-thumbnails")],iB);var iD=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let iW=class extends i.oi{constructor(){super(...arguments),this.dappName=a.OptionsController.state.metadata?.name,this.isCancelling=!1,this.isSigning=!1}render(){return(0,i.dy)`
      <wui-flex justifyContent="center" .padding=${["8","0","6","0"]}>
        <w3m-siwx-sign-message-thumbnails></w3m-siwx-sign-message-thumbnails>
      </wui-flex>
      <wui-flex .padding=${["0","20","5","20"]} gap="3" justifyContent="space-between">
        <wui-text variant="lg-medium" align="center" color="primary"
          >${this.dappName??"Dapp"} needs to connect to your wallet</wui-text
        >
      </wui-flex>
      <wui-flex .padding=${["0","10","4","10"]} gap="3" justifyContent="space-between">
        <wui-text variant="md-regular" align="center" color="secondary"
          >Sign this message to prove you own this wallet and proceed. Canceling will disconnect
          you.</wui-text
        >
      </wui-flex>
      <wui-flex .padding=${["4","5","5","5"]} gap="3" justifyContent="space-between">
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="neutral-secondary"
          ?loading=${this.isCancelling}
          @click=${this.onCancel.bind(this)}
          data-testid="w3m-connecting-siwe-cancel"
        >
          ${this.isCancelling?"Cancelling...":"Cancel"}
        </wui-button>
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="neutral-primary"
          @click=${this.onSign.bind(this)}
          ?loading=${this.isSigning}
          data-testid="w3m-connecting-siwe-sign"
        >
          ${this.isSigning?"Signing...":"Sign"}
        </wui-button>
      </wui-flex>
    `}async onSign(){this.isSigning=!0;try{await iT.w.requestSignMessage()}catch(e){if(e instanceof Error&&e.message.includes("OTP is required")){Z.SnackController.showError({message:"Something went wrong. We need to verify your account again."}),Q.RouterController.replace("DataCapture");return}throw e}finally{this.isSigning=!1}}async onCancel(){this.isCancelling=!0,await iT.w.cancelSignMessage().finally(()=>this.isCancelling=!1)}};iD([(0,n.SB)()],iW.prototype,"isCancelling",void 0),iD([(0,n.SB)()],iW.prototype,"isSigning",void 0),iW=iD([(0,p.Mo)("w3m-siwx-sign-message-view")],iW)},71799:function(e,t,o){var i=o(19064),n=o(59662),r=o(77282),a=o(4511),s=o(83662),l=o(28740),c=(0,i.iv)`
  :host {
    width: 100%;
    display: block;
  }
`,d=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let u=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.text="",this.open=r.f.state.open,this.unsubscribe.push(a.RouterController.subscribeKey("view",()=>{r.f.hide()}),s.I.subscribeKey("open",e=>{e||r.f.hide()}),r.f.subscribeKey("open",e=>{this.open=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),r.f.hide()}render(){return(0,i.dy)`
      <div
        @pointermove=${this.onMouseEnter.bind(this)}
        @pointerleave=${this.onMouseLeave.bind(this)}
      >
        ${this.renderChildren()}
      </div>
    `}renderChildren(){return(0,i.dy)`<slot></slot> `}onMouseEnter(){let e=this.getBoundingClientRect();if(!this.open){let t=document.querySelector("w3m-modal"),o={width:e.width,height:e.height,left:e.left,top:e.top};if(t){let i=t.getBoundingClientRect();o.left=e.left-(window.innerWidth-i.width)/2,o.top=e.top-(window.innerHeight-i.height)/2}r.f.showTooltip({message:this.text,triggerRect:o,variant:"shade"})}}onMouseLeave(e){this.contains(e.relatedTarget)||r.f.hide()}};u.styles=[c],d([(0,n.Cb)()],u.prototype,"text",void 0),d([(0,n.SB)()],u.prototype,"open",void 0),d([(0,l.Mo)("w3m-tooltip-trigger")],u)},6167:function(e,t,o){var i=o(19064),n=o(59662),r=o(35162);o(21927),o(79556);var a=o(24134),s=o(25729);o(72785);var l=(0,i.iv)`
  :host {
    position: relative;
    display: inline-block;
    width: 100%;
  }
`,c=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let d=class extends i.oi{constructor(){super(...arguments),this.disabled=!1}render(){return(0,i.dy)`
      <wui-input-text
        type="email"
        placeholder="Email"
        icon="mail"
        size="lg"
        .disabled=${this.disabled}
        .value=${this.value}
        data-testid="wui-email-input"
        tabIdx=${(0,r.o)(this.tabIdx)}
      ></wui-input-text>
      ${this.templateError()}
    `}templateError(){return this.errorMessage?(0,i.dy)`<wui-text variant="sm-regular" color="error">${this.errorMessage}</wui-text>`:null}};d.styles=[a.ET,l],c([(0,n.Cb)()],d.prototype,"errorMessage",void 0),c([(0,n.Cb)({type:Boolean})],d.prototype,"disabled",void 0),c([(0,n.Cb)()],d.prototype,"value",void 0),c([(0,n.Cb)()],d.prototype,"tabIdx",void 0),c([(0,s.M)("wui-email-input")],d)},8035:function(e,t,o){o(42672)},75022:function(e,t,o){var i=o(19064),n=o(59662),r=o(35162);o(79556);var a=o(24134),s=o(25729);o(51880);var l=o(95636),c=(0,l.iv)`
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
`,d=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let u=class extends i.oi{constructor(){super(...arguments),this.logo="google",this.name="Continue with google",this.disabled=!1}render(){return(0,i.dy)`
      <button ?disabled=${this.disabled} tabindex=${(0,r.o)(this.tabIdx)}>
        <wui-flex gap="2" alignItems="center">
          <wui-image ?boxed=${!0} logo=${this.logo}></wui-image>
          <wui-text variant="lg-regular" color="primary">${this.name}</wui-text>
        </wui-flex>
        <wui-icon name="chevronRight" size="lg" color="default"></wui-icon>
      </button>
    `}};u.styles=[a.ET,a.ZM,c],d([(0,n.Cb)()],u.prototype,"logo",void 0),d([(0,n.Cb)()],u.prototype,"name",void 0),d([(0,n.Cb)()],u.prototype,"tabIdx",void 0),d([(0,n.Cb)({type:Boolean})],u.prototype,"disabled",void 0),d([(0,s.M)("wui-list-social")],u)},48808:function(e,t,o){var i=o(19064),n=o(59662);let r=(0,i.YP)`<svg width="86" height="96" fill="none">
  <path
    d="M78.3244 18.926L50.1808 2.45078C45.7376 -0.150261 40.2624 -0.150262 35.8192 2.45078L7.6756 18.926C3.23322 21.5266 0.5 26.3301 0.5 31.5248V64.4752C0.5 69.6699 3.23322 74.4734 7.6756 77.074L35.8192 93.5492C40.2624 96.1503 45.7376 96.1503 50.1808 93.5492L78.3244 77.074C82.7668 74.4734 85.5 69.6699 85.5 64.4752V31.5248C85.5 26.3301 82.7668 21.5266 78.3244 18.926Z"
  />
</svg>`;var a=o(16965);let s=(0,i.YP)`
  <svg fill="none" viewBox="0 0 36 40">
    <path
      d="M15.4 2.1a5.21 5.21 0 0 1 5.2 0l11.61 6.7a5.21 5.21 0 0 1 2.61 4.52v13.4c0 1.87-1 3.59-2.6 4.52l-11.61 6.7c-1.62.93-3.6.93-5.22 0l-11.6-6.7a5.21 5.21 0 0 1-2.61-4.51v-13.4c0-1.87 1-3.6 2.6-4.52L15.4 2.1Z"
    />
  </svg>
`;o(21927),o(31059);var l=o(24134),c=o(25729),d=o(95636),u=(0,d.iv)`
  :host {
    position: relative;
    border-radius: inherit;
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--local-width);
    height: var(--local-height);
  }

  :host([data-round='true']) {
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: 100%;
    outline: 1px solid ${({tokens:e})=>e.core.glass010};
  }

  svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  svg > path {
    stroke: var(--local-stroke);
  }

  wui-image {
    width: 100%;
    height: 100%;
    -webkit-clip-path: var(--local-path);
    clip-path: var(--local-path);
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  wui-icon {
    transform: translateY(-5%);
    width: var(--local-icon-size);
    height: var(--local-icon-size);
  }
`,h=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let p=class extends i.oi{constructor(){super(...arguments),this.size="md",this.name="uknown",this.networkImagesBySize={sm:s,md:a.W,lg:r},this.selected=!1,this.round=!1}render(){return this.round?(this.dataset.round="true",this.style.cssText=`
      --local-width: var(--apkt-spacing-10);
      --local-height: var(--apkt-spacing-10);
      --local-icon-size: var(--apkt-spacing-4);
    `):this.style.cssText=`

      --local-path: var(--apkt-path-network-${this.size});
      --local-width:  var(--apkt-width-network-${this.size});
      --local-height:  var(--apkt-height-network-${this.size});
      --local-icon-size:  var(--apkt-spacing-${({sm:"4",md:"6",lg:"10"})[this.size]});
    `,(0,i.dy)`${this.templateVisual()} ${this.svgTemplate()} `}svgTemplate(){return this.round?null:this.networkImagesBySize[this.size]}templateVisual(){return this.imageSrc?(0,i.dy)`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`:(0,i.dy)`<wui-icon size="inherit" color="default" name="networkPlaceholder"></wui-icon>`}};p.styles=[l.ET,u],h([(0,n.Cb)()],p.prototype,"size",void 0),h([(0,n.Cb)()],p.prototype,"name",void 0),h([(0,n.Cb)({type:Object})],p.prototype,"networkImagesBySize",void 0),h([(0,n.Cb)()],p.prototype,"imageSrc",void 0),h([(0,n.Cb)({type:Boolean})],p.prototype,"selected",void 0),h([(0,n.Cb)({type:Boolean})],p.prototype,"round",void 0),h([(0,c.M)("wui-network-image")],p)},91833:function(e,t,o){o(22584)},73783:function(e,t,o){o(55018)},16965:function(e,t,o){o.d(t,{W:function(){return n}});var i=o(19064);let n=(0,i.YP)`<svg  viewBox="0 0 48 54" fill="none">
  <path
    d="M43.4605 10.7248L28.0485 1.61089C25.5438 0.129705 22.4562 0.129705 19.9515 1.61088L4.53951 10.7248C2.03626 12.2051 0.5 14.9365 0.5 17.886V36.1139C0.5 39.0635 2.03626 41.7949 4.53951 43.2752L19.9515 52.3891C22.4562 53.8703 25.5438 53.8703 28.0485 52.3891L43.4605 43.2752C45.9637 41.7949 47.5 39.0635 47.5 36.114V17.8861C47.5 14.9365 45.9637 12.2051 43.4605 10.7248Z"
  />
</svg>`},98576:function(e,t,o){var i=o(19064),n=o(59662);o(31059);var r=o(24134),a=o(1512),s=o(25729),l=o(95636),c=(0,l.iv)`
  :host {
    display: block;
    width: var(--local-width);
    height: var(--local-height);
    border-radius: ${({borderRadius:e})=>e[16]};
    overflow: hidden;
    position: relative;
  }

  :host([data-variant='generated']) {
    --mixed-local-color-1: var(--local-color-1);
    --mixed-local-color-2: var(--local-color-2);
    --mixed-local-color-3: var(--local-color-3);
    --mixed-local-color-4: var(--local-color-4);
    --mixed-local-color-5: var(--local-color-5);
  }

  :host([data-variant='generated']) {
    background: radial-gradient(
      var(--local-radial-circle),
      #fff 0.52%,
      var(--mixed-local-color-5) 31.25%,
      var(--mixed-local-color-3) 51.56%,
      var(--mixed-local-color-2) 65.63%,
      var(--mixed-local-color-1) 82.29%,
      var(--mixed-local-color-4) 100%
    );
  }

  :host([data-variant='default']) {
    background: radial-gradient(
      75.29% 75.29% at 64.96% 24.36%,
      #fff 0.52%,
      #f5ccfc 31.25%,
      #dba4f5 51.56%,
      #9a8ee8 65.63%,
      #6493da 82.29%,
      #6ebdea 100%
    );
  }
`,d=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let u=class extends i.oi{constructor(){super(...arguments),this.imageSrc=void 0,this.alt=void 0,this.address=void 0,this.size="xl"}render(){let e={inherit:"inherit",xxs:"3",xs:"5",sm:"6",md:"8",mdl:"8",lg:"10",xl:"16",xxl:"20"};return this.style.cssText=`
    --local-width: var(--apkt-spacing-${e[this.size??"xl"]});
    --local-height: var(--apkt-spacing-${e[this.size??"xl"]});
    `,(0,i.dy)`${this.visualTemplate()}`}visualTemplate(){if(this.imageSrc)return this.dataset.variant="image",(0,i.dy)`<wui-image src=${this.imageSrc} alt=${this.alt??"avatar"}></wui-image>`;if(this.address){this.dataset.variant="generated";let e=a.H.generateAvatarColors(this.address);return this.style.cssText+=`
 ${e}`,null}return this.dataset.variant="default",null}};u.styles=[r.ET,c],d([(0,n.Cb)()],u.prototype,"imageSrc",void 0),d([(0,n.Cb)()],u.prototype,"alt",void 0),d([(0,n.Cb)()],u.prototype,"address",void 0),d([(0,n.Cb)()],u.prototype,"size",void 0),d([(0,s.M)("wui-avatar")],u)},42672:function(e,t,o){var i=o(19064),n=o(59662);o(21927);var r=o(24134),a=o(25729),s=o(95636),l=(0,s.iv)`
  button {
    background-color: transparent;
    padding: ${({spacing:e})=>e[1]};
  }

  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent020};
  }

  button[data-variant='accent']:hover:enabled,
  button[data-variant='accent']:focus-visible {
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  button[data-variant='primary']:hover:enabled,
  button[data-variant='primary']:focus-visible,
  button[data-variant='secondary']:hover:enabled,
  button[data-variant='secondary']:focus-visible {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  button[data-size='xs'] > wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] > wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='xs'],
  button[data-size='sm'] {
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='md'],
  button[data-size='lg'] {
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='md'] > wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] > wui-icon {
    width: 20px;
    height: 20px;
  }

  button:disabled {
    background-color: transparent;
    cursor: not-allowed;
    opacity: 0.5;
  }

  button:hover:not(:disabled) {
    background-color: var(--wui-color-accent-glass-015);
  }

  button:focus-visible:not(:disabled) {
    background-color: var(--wui-color-accent-glass-015);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0 0 0 4px var(--wui-color-accent-glass-020);
  }
`,c=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let d=class extends i.oi{constructor(){super(...arguments),this.size="md",this.disabled=!1,this.icon="copy",this.iconColor="default",this.variant="accent"}render(){return(0,i.dy)`
      <button data-variant=${this.variant} ?disabled=${this.disabled} data-size=${this.size}>
        <wui-icon
          color=${({accent:"accent-primary",primary:"inverse",secondary:"default"})[this.variant]||this.iconColor}
          size=${this.size}
          name=${this.icon}
        ></wui-icon>
      </button>
    `}};d.styles=[r.ET,r.ZM,l],c([(0,n.Cb)()],d.prototype,"size",void 0),c([(0,n.Cb)({type:Boolean})],d.prototype,"disabled",void 0),c([(0,n.Cb)()],d.prototype,"icon",void 0),c([(0,n.Cb)()],d.prototype,"iconColor",void 0),c([(0,n.Cb)()],d.prototype,"variant",void 0),c([(0,a.M)("wui-icon-link")],d)},51880:function(e,t,o){var i=o(19064),n=o(59662);o(21927);var r=o(24134),a=o(25729),s=o(95636),l=(0,s.iv)`
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
`,c=function(e,t,o,i){var n,r=arguments.length,a=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,o,i);else for(var s=e.length-1;s>=0;s--)(n=e[s])&&(a=(r<3?n(a):r>3?n(t,o,a):n(t,o))||a);return r>3&&a&&Object.defineProperty(t,o,a),a};let d=class extends i.oi{constructor(){super(...arguments),this.logo="google"}render(){return(0,i.dy)`<wui-icon color="inherit" size="inherit" name=${this.logo}></wui-icon> `}};d.styles=[r.ET,l],c([(0,n.Cb)()],d.prototype,"logo",void 0),c([(0,a.M)("wui-logo")],d)}}]);