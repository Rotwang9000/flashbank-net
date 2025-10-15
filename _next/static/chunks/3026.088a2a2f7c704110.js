"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3026],{63026:function(e,t,r){r.r(t),r.d(t,{W3mWalletReceiveView:function(){return $}});var i=r(19064),o=r(59662),n=r(35162),s=r(83966),a=r(59757),c=r(82879),l=r(44639),u=r(12858),d=r(18462),w=r(4511),p=r(83241),h=r(28740);r(21927),r(31059),r(79556),r(76630);var m=r(24134),f=r(25729),b=r(95636),g=(0,b.iv)`
  button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({spacing:e})=>e[4]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[3]};
    border: none;
    padding: ${({spacing:e})=>e[3]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button:hover:enabled,
  button:active:enabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  wui-text {
    flex: 1;
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  wui-flex {
    width: auto;
    display: flex;
    align-items: center;
    gap: ${({spacing:e})=>e["01"]};
  }

  wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  .network-icon {
    position: relative;
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[4]};
    overflow: hidden;
    margin-left: -8px;
  }

  .network-icon:first-child {
    margin-left: 0px;
  }

  .network-icon:after {
    position: absolute;
    inset: 0;
    content: '';
    display: block;
    height: 100%;
    width: 100%;
    border-radius: ${({borderRadius:e})=>e[4]};
    box-shadow: inset 0 0 0 1px ${({tokens:e})=>e.core.glass010};
  }
`,k=function(e,t,r,i){var o,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,r,i);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(n<3?o(s):n>3?o(t,r,s):o(t,r))||s);return n>3&&s&&Object.defineProperty(t,r,s),s};let y=class extends i.oi{constructor(){super(...arguments),this.networkImages=[""],this.text=""}render(){return(0,i.dy)`
      <button>
        <wui-text variant="md-regular" color="inherit">${this.text}</wui-text>
        <wui-flex>
          ${this.networksTemplate()}
          <wui-icon name="chevronRight" size="sm" color="inherit"></wui-icon>
        </wui-flex>
      </button>
    `}networksTemplate(){let e=this.networkImages.slice(0,5);return(0,i.dy)` <wui-flex class="networks">
      ${e?.map(e=>i.dy` <wui-flex class="network-icon"> <wui-image src=${e}></wui-image> </wui-flex>`)}
    </wui-flex>`}};y.styles=[m.ET,m.ZM,g],k([(0,o.Cb)({type:Array})],y.prototype,"networkImages",void 0),k([(0,o.Cb)()],y.prototype,"text",void 0),y=k([(0,f.M)("wui-compatible-network")],y),r(82100),r(18370),r(68390);var v=r(22192),x=(0,h.iv)`
  wui-compatible-network {
    margin-top: ${({spacing:e})=>e["4"]};
    width: 100%;
  }

  wui-qr-code {
    width: unset !important;
    height: unset !important;
  }

  wui-icon {
    align-items: normal;
  }
`,C=function(e,t,r,i){var o,n=arguments.length,s=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,r,i);else for(var a=e.length-1;a>=0;a--)(o=e[a])&&(s=(n<3?o(s):n>3?o(t,r,s):o(t,r))||s);return n>3&&s&&Object.defineProperty(t,r,s),s};let $=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.address=s.AccountController.state.address,this.profileName=s.AccountController.state.profileName,this.network=a.R.state.activeCaipNetwork,this.unsubscribe.push(s.AccountController.subscribe(e=>{e.address?(this.address=e.address,this.profileName=e.profileName):c.SnackController.showError("Account not found")}),a.R.subscribeKey("activeCaipNetwork",e=>{e?.id&&(this.network=e)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){if(!this.address)throw Error("w3m-wallet-receive-view: No account provided");let e=l.f.getNetworkImage(this.network);return(0,i.dy)` <wui-flex
      flexDirection="column"
      .padding=${["0","4","4","4"]}
      alignItems="center"
    >
      <wui-chip-button
        data-testid="receive-address-copy-button"
        @click=${this.onCopyClick.bind(this)}
        text=${h.Hg.getTruncateString({string:this.profileName||this.address||"",charsStart:this.profileName?18:4,charsEnd:this.profileName?0:4,truncate:this.profileName?"end":"middle"})}
        icon="copy"
        size="sm"
        imageSrc=${e||""}
        variant="gray"
      ></wui-chip-button>
      <wui-flex
        flexDirection="column"
        .padding=${["4","0","0","0"]}
        alignItems="center"
        gap="4"
      >
        <wui-qr-code
          size=${232}
          theme=${u.ThemeController.state.themeMode}
          uri=${this.address}
          ?arenaClear=${!0}
          color=${(0,n.o)(u.ThemeController.state.themeVariables["--w3m-qr-color"])}
          data-testid="wui-qr-code"
        ></wui-qr-code>
        <wui-text variant="lg-regular" color="primary" align="center">
          Copy your address or scan this QR code
        </wui-text>
        <wui-button @click=${this.onCopyClick.bind(this)} size="sm" variant="neutral-secondary">
          <wui-icon slot="iconLeft" size="sm" color="inherit" name="copy"></wui-icon>
          <wui-text variant="md-regular" color="inherit">Copy address</wui-text>
        </wui-button>
      </wui-flex>
      ${this.networkTemplate()}
    </wui-flex>`}networkTemplate(){let e=a.R.getAllRequestedCaipNetworks(),t=a.R.checkIfSmartAccountEnabled(),r=a.R.state.activeCaipNetwork,o=e.filter(e=>e?.chainNamespace===r?.chainNamespace);if((0,d.r9)(r?.chainNamespace)===v.y_.ACCOUNT_TYPES.SMART_ACCOUNT&&t)return r?(0,i.dy)`<wui-compatible-network
        @click=${this.onReceiveClick.bind(this)}
        text="Only receive assets on this network"
        .networkImages=${[l.f.getNetworkImage(r)??""]}
      ></wui-compatible-network>`:null;let n=(o?.filter(e=>e?.assets?.imageId)?.slice(0,5)).map(l.f.getNetworkImage).filter(Boolean);return(0,i.dy)`<wui-compatible-network
      @click=${this.onReceiveClick.bind(this)}
      text="Only receive assets on these networks"
      .networkImages=${n}
    ></wui-compatible-network>`}onReceiveClick(){w.RouterController.push("WalletCompatibleNetworks")}onCopyClick(){try{this.address&&(p.j.copyToClopboard(this.address),c.SnackController.showSuccess("Address copied"))}catch{c.SnackController.showError("Failed to copy")}}};$.styles=x,C([(0,o.SB)()],$.prototype,"address",void 0),C([(0,o.SB)()],$.prototype,"profileName",void 0),C([(0,o.SB)()],$.prototype,"network",void 0),$=C([(0,h.Mo)("w3m-wallet-receive-view")],$)},35162:function(e,t,r){r.d(t,{o:function(){return o}});var i=r(33692);let o=e=>e??i.Ld}}]);