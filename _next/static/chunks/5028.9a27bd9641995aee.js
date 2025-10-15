"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5028],{92103:function(e,t,r){r.d(t,{u:function(){return w}});var i=r(86949),o=r(73932),n=r(62411),a=r(18462),s=r(47205),c=r(83241),u=r(49774),l=r(83966),d=r(66691),p=r(59757),h=r(51440),m=r(77500),y=r(82879);let b={paymentAsset:null,amount:null,tokenAmount:0,priceLoading:!1,error:null,exchanges:[],isLoading:!1,currentPayment:void 0,isPaymentInProgress:!1,paymentId:"",assets:[]},g=(0,i.sj)(b),w={state:g,subscribe:e=>(0,i.Ld)(g,()=>e(g)),subscribeKey:(e,t)=>(0,o.VW)(g,e,t),resetState(){Object.assign(g,{...b})},async getAssetsForNetwork(e){let t=(0,u.ec)(e),r=await w.getAssetsImageAndPrice(t),i=t.map(e=>{let t="native"===e.asset?(0,a.EO)():`${e.network}:${e.asset}`,i=r.find(e=>e.fungibles?.[0]?.address?.toLowerCase()===t.toLowerCase());return{...e,price:i?.fungibles?.[0]?.price||1,metadata:{...e.metadata,iconUrl:i?.fungibles?.[0]?.iconUrl}}});return g.assets=i,i},async getAssetsImageAndPrice(e){let t=e.map(e=>"native"===e.asset?(0,a.EO)():`${e.network}:${e.asset}`);return await Promise.all(t.map(e=>d.L.fetchTokenPrice({addresses:[e]})))},getTokenAmount(){if(!g?.paymentAsset?.price)throw Error("Cannot get token price");let e=n.C.bigNumber(g.amount??0).round(8),t=n.C.bigNumber(g.paymentAsset.price).round(8);return e.div(t).round(8).toNumber()},setAmount(e){g.amount=e,g.paymentAsset?.price&&(g.tokenAmount=w.getTokenAmount())},setPaymentAsset(e){g.paymentAsset=e},isPayWithExchangeEnabled:()=>m.OptionsController.state.remoteFeatures?.payWithExchange||m.OptionsController.state.remoteFeatures?.payments||m.OptionsController.state.features?.pay,isPayWithExchangeSupported:()=>w.isPayWithExchangeEnabled()&&p.R.state.activeCaipNetwork&&s.bq.PAY_WITH_EXCHANGE_SUPPORTED_CHAIN_NAMESPACES.includes(p.R.state.activeCaipNetwork.chainNamespace),async fetchExchanges(){try{let e=w.isPayWithExchangeSupported();if(!g.paymentAsset||!e){g.exchanges=[],g.isLoading=!1;return}g.isLoading=!0;let t=await (0,u.YK)({page:0,asset:(0,u.Us)(g.paymentAsset.network,g.paymentAsset.asset),amount:g.amount?.toString()??"0"});g.exchanges=t.exchanges.slice(0,2)}catch(e){throw y.SnackController.showError("Unable to get exchanges"),Error("Unable to get exchanges")}finally{g.isLoading=!1}},async getPayUrl(e,t){try{let r=Number(t.amount),i=await (0,u.kv)({exchangeId:e,asset:(0,u.Us)(t.network,t.asset),amount:r.toString(),recipient:`${t.network}:${t.recipient}`});return h.X.sendEvent({type:"track",event:"PAY_EXCHANGE_SELECTED",properties:{exchange:{id:e},configuration:{network:t.network,asset:t.asset,recipient:t.recipient,amount:r},currentPayment:{type:"exchange",exchangeId:e},source:"fund-from-exchange",headless:!1}}),i}catch(e){if(e instanceof Error&&e.message.includes("is not supported"))throw Error("Asset not supported");throw Error(e.message)}},async handlePayWithExchange(e){try{if(!l.AccountController.state.address)throw Error("No account connected");if(!g.paymentAsset)throw Error("No payment asset selected");let t=c.j.returnOpenHref("","popupWindow","scrollbar=yes,width=480,height=720");if(!t)throw Error("Could not create popup window");g.isPaymentInProgress=!0,g.paymentId=crypto.randomUUID(),g.currentPayment={type:"exchange",exchangeId:e};let{network:r,asset:i}=g.paymentAsset,o={network:r,asset:i,amount:g.tokenAmount,recipient:l.AccountController.state.address},n=await w.getPayUrl(e,o);if(!n){try{t.close()}catch(e){console.error("Unable to close popup window",e)}throw Error("Unable to initiate payment")}g.currentPayment.sessionId=n.sessionId,g.currentPayment.status="IN_PROGRESS",g.currentPayment.exchangeId=e,t.location.href=n.url}catch(e){g.error="Unable to initiate payment",y.SnackController.showError(g.error)}},async waitUntilComplete({exchangeId:e,sessionId:t,paymentId:r,retries:i=20}){let o=await w.getBuyStatus(e,t,r);if("SUCCESS"===o.status||"FAILED"===o.status)return o;if(0===i)throw Error("Unable to get deposit status");return await new Promise(e=>{setTimeout(e,5e3)}),w.waitUntilComplete({exchangeId:e,sessionId:t,paymentId:r,retries:i-1})},async getBuyStatus(e,t,r){try{if(!g.currentPayment)throw Error("No current payment");let i=await (0,u.Cx)({sessionId:t,exchangeId:e});return g.currentPayment.status=i.status,("SUCCESS"===i.status||"FAILED"===i.status)&&(g.currentPayment.result=i.txHash,g.isPaymentInProgress=!1,h.X.sendEvent({type:"track",event:"SUCCESS"===i.status?"PAY_SUCCESS":"PAY_ERROR",properties:{message:"FAILED"===i.status?c.j.parseError(g.error):void 0,source:"fund-from-exchange",paymentId:r,configuration:{network:g.paymentAsset?.network||"",asset:g.paymentAsset?.asset||"",recipient:l.AccountController.state.address||"",amount:g.amount??0},currentPayment:{type:"exchange",exchangeId:g.currentPayment?.exchangeId,sessionId:g.currentPayment?.sessionId,result:i.txHash}}})),i}catch(e){return{status:"UNKNOWN",txHash:""}}},reset(){g.currentPayment=void 0,g.isPaymentInProgress=!1,g.paymentId="",g.paymentAsset=null,g.amount=0,g.tokenAmount=0,g.priceLoading=!1,g.error=null,g.exchanges=[],g.isLoading=!1}}},65028:function(e,t,r){r.r(t),r.d(t,{W3mBuyInProgressView:function(){return N},W3mFundWalletView:function(){return U},W3mOnRampProvidersView:function(){return R},W3mOnrampFiatSelectView:function(){return m},W3mOnrampTokensView:function(){return E},W3mOnrampWidget:function(){return Y},W3mWhatIsABuyView:function(){return D}});var i=r(19064),o=r(59662),n=r(35162),a=r(78600),s=r(87374),c=r(88686),u=r(77500),l=r(83662),d=r(28740);r(82100),r(84350),r(68390),r(27912);var p=(0,d.iv)`
  :host > wui-grid {
    max-height: 360px;
    overflow: auto;
  }

  wui-flex {
    transition: opacity ${({easings:e})=>e["ease-out-power-1"]}
      ${({durations:e})=>e.md};
    will-change: opacity;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-flex.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }
`,h=function(e,t,r,i){var o,n=arguments.length,a=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,r,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(n<3?o(a):n>3?o(t,r,a):o(t,r))||a);return n>3&&a&&Object.defineProperty(t,r,a),a};let m=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.selectedCurrency=a.ph.state.paymentCurrency,this.currencies=a.ph.state.paymentCurrencies,this.currencyImages=s.W.state.currencyImages,this.checked=c.M.state.isLegalCheckboxChecked,this.unsubscribe.push(a.ph.subscribe(e=>{this.selectedCurrency=e.paymentCurrency,this.currencies=e.paymentCurrencies}),s.W.subscribeKey("currencyImages",e=>this.currencyImages=e),c.M.subscribeKey("isLegalCheckboxChecked",e=>{this.checked=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=u.OptionsController.state,r=u.OptionsController.state.features?.legalCheckbox,o=!!(e||t)&&!!r&&!this.checked;return(0,i.dy)`
      <w3m-legal-checkbox></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${["0","3","3","3"]}
        gap="2"
        class=${(0,n.o)(o?"disabled":void 0)}
      >
        ${this.currenciesTemplate(o)}
      </wui-flex>
    `}currenciesTemplate(e=!1){return this.currencies.map(t=>(0,i.dy)`
        <wui-list-item
          imageSrc=${(0,n.o)(this.currencyImages?.[t.id])}
          @click=${()=>this.selectCurrency(t)}
          variant="image"
          tabIdx=${(0,n.o)(e?-1:void 0)}
        >
          <wui-text variant="md-medium" color="primary">${t.id}</wui-text>
        </wui-list-item>
      `)}selectCurrency(e){e&&(a.ph.setPaymentCurrency(e),l.I.close())}};m.styles=p,h([(0,o.SB)()],m.prototype,"selectedCurrency",void 0),h([(0,o.SB)()],m.prototype,"currencies",void 0),h([(0,o.SB)()],m.prototype,"currencyImages",void 0),h([(0,o.SB)()],m.prototype,"checked",void 0),m=h([(0,d.Mo)("w3m-onramp-fiat-select-view")],m);var y=r(59757),b=r(4511),g=r(83241),w=r(51440),f=r(18462),v=r(22192),x=r(44639);r(85642),r(87809),r(73049),r(40256);var $=(0,d.iv)`
  button {
    padding: ${({spacing:e})=>e["3"]};
    border-radius: ${({borderRadius:e})=>e["4"]};
    border: none;
    outline: none;
    background-color: ${({tokens:e})=>e.core.glass010};
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: ${({spacing:e})=>e["3"]};
    transition: background-color ${({easings:e})=>e["ease-out-power-1"]}
      ${({durations:e})=>e.md};
    will-change: background-color;
    cursor: pointer;
  }

  button:hover {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  .provider-image {
    width: ${({spacing:e})=>e["10"]};
    min-width: ${({spacing:e})=>e["10"]};
    height: ${({spacing:e})=>e["10"]};
    border-radius: calc(
      ${({borderRadius:e})=>e["4"]} - calc(${({spacing:e})=>e["3"]} / 2)
    );
    position: relative;
    overflow: hidden;
  }

  .network-icon {
    width: ${({spacing:e})=>e["3"]};
    height: ${({spacing:e})=>e["3"]};
    border-radius: calc(${({spacing:e})=>e["3"]} / 2);
    overflow: hidden;
    box-shadow:
      0 0 0 3px ${({tokens:e})=>e.theme.foregroundPrimary},
      0 0 0 3px ${({tokens:e})=>e.theme.backgroundPrimary};
    transition: box-shadow ${({easings:e})=>e["ease-out-power-1"]}
      ${({durations:e})=>e.md};
    will-change: box-shadow;
  }

  button:hover .network-icon {
    box-shadow:
      0 0 0 3px ${({tokens:e})=>e.core.glass010},
      0 0 0 3px ${({tokens:e})=>e.theme.backgroundPrimary};
  }
`,C=function(e,t,r,i){var o,n=arguments.length,a=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,r,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(n<3?o(a):n>3?o(t,r,a):o(t,r))||a);return n>3&&a&&Object.defineProperty(t,r,a),a};let k=class extends i.oi{constructor(){super(...arguments),this.disabled=!1,this.color="inherit",this.label="",this.feeRange="",this.loading=!1,this.onClick=null}render(){return(0,i.dy)`
      <button ?disabled=${this.disabled} @click=${this.onClick} ontouchstart>
        <wui-visual name=${(0,n.o)(this.name)} class="provider-image"></wui-visual>
        <wui-flex flexDirection="column" gap="01">
          <wui-text variant="md-regular" color="primary">${this.label}</wui-text>
          <wui-flex alignItems="center" justifyContent="flex-start" gap="4">
            <wui-text variant="sm-medium" color="primary">
              <wui-text variant="sm-regular" color="secondary">Fees</wui-text>
              ${this.feeRange}
            </wui-text>
            <wui-flex gap="2">
              <wui-icon name="bank" size="sm" color="default"></wui-icon>
              <wui-icon name="card" size="sm" color="default"></wui-icon>
            </wui-flex>
            ${this.networksTemplate()}
          </wui-flex>
        </wui-flex>
        ${this.loading?(0,i.dy)`<wui-loading-spinner color="secondary" size="md"></wui-loading-spinner>`:(0,i.dy)`<wui-icon name="chevronRight" color="default" size="sm"></wui-icon>`}
      </button>
    `}networksTemplate(){let e=y.R.getAllRequestedCaipNetworks(),t=e?.filter(e=>e?.assets?.imageId)?.slice(0,5);return(0,i.dy)`
      <wui-flex class="networks">
        ${t?.map(e=>i.dy`
            <wui-flex class="network-icon">
              <wui-image src=${n.o(x.f.getNetworkImage(e))}></wui-image>
            </wui-flex>
          `)}
      </wui-flex>
    `}};k.styles=[$],C([(0,o.Cb)({type:Boolean})],k.prototype,"disabled",void 0),C([(0,o.Cb)()],k.prototype,"color",void 0),C([(0,o.Cb)()],k.prototype,"name",void 0),C([(0,o.Cb)()],k.prototype,"label",void 0),C([(0,o.Cb)()],k.prototype,"feeRange",void 0),C([(0,o.Cb)({type:Boolean})],k.prototype,"loading",void 0),C([(0,o.Cb)()],k.prototype,"onClick",void 0),k=C([(0,d.Mo)("w3m-onramp-provider-item")],k),r(46647);var P=function(e,t,r,i){var o,n=arguments.length,a=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,r,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(n<3?o(a):n>3?o(t,r,a):o(t,r))||a);return n>3&&a&&Object.defineProperty(t,r,a),a};let R=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.providers=a.ph.state.providers,this.unsubscribe.push(a.ph.subscribeKey("providers",e=>{this.providers=e}))}render(){return(0,i.dy)`
      <wui-flex flexDirection="column" .padding=${["0","3","3","3"]} gap="2">
        ${this.onRampProvidersTemplate()}
      </wui-flex>
    `}onRampProvidersTemplate(){return this.providers.filter(e=>e.supportedChains.includes(y.R.state.activeChain??"eip155")).map(e=>(0,i.dy)`
          <w3m-onramp-provider-item
            label=${e.label}
            name=${e.name}
            feeRange=${e.feeRange}
            @click=${()=>{this.onClickProvider(e)}}
            ?disabled=${!e.url}
            data-testid=${`onramp-provider-${e.name}`}
          ></w3m-onramp-provider-item>
        `)}onClickProvider(e){a.ph.setSelectedProvider(e),b.RouterController.push("BuyInProgress"),g.j.openHref(a.ph.state.selectedProvider?.url||e.url,"popupWindow","width=600,height=800,scrollbars=yes"),w.X.sendEvent({type:"track",event:"SELECT_BUY_PROVIDER",properties:{provider:e.name,isSmartAccount:(0,f.r9)(y.R.state.activeChain)===v.y_.ACCOUNT_TYPES.SMART_ACCOUNT}})}};P([(0,o.SB)()],R.prototype,"providers",void 0),R=P([(0,d.Mo)("w3m-onramp-providers-view")],R),r(86081);var A=(0,d.iv)`
  :host > wui-grid {
    max-height: 360px;
    overflow: auto;
  }

  wui-flex {
    transition: opacity ${({easings:e})=>e["ease-out-power-1"]}
      ${({durations:e})=>e.md};
    will-change: opacity;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-flex.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }
`,S=function(e,t,r,i){var o,n=arguments.length,a=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,r,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(n<3?o(a):n>3?o(t,r,a):o(t,r))||a);return n>3&&a&&Object.defineProperty(t,r,a),a};let E=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.selectedCurrency=a.ph.state.purchaseCurrencies,this.tokens=a.ph.state.purchaseCurrencies,this.tokenImages=s.W.state.tokenImages,this.checked=c.M.state.isLegalCheckboxChecked,this.unsubscribe.push(a.ph.subscribe(e=>{this.selectedCurrency=e.purchaseCurrencies,this.tokens=e.purchaseCurrencies}),s.W.subscribeKey("tokenImages",e=>this.tokenImages=e),c.M.subscribeKey("isLegalCheckboxChecked",e=>{this.checked=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=u.OptionsController.state,r=u.OptionsController.state.features?.legalCheckbox,o=!!(e||t)&&!!r&&!this.checked;return(0,i.dy)`
      <w3m-legal-checkbox></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${["0","3","3","3"]}
        gap="2"
        class=${(0,n.o)(o?"disabled":void 0)}
      >
        ${this.currenciesTemplate(o)}
      </wui-flex>
    `}currenciesTemplate(e=!1){return this.tokens.map(t=>(0,i.dy)`
        <wui-list-item
          imageSrc=${(0,n.o)(this.tokenImages?.[t.symbol])}
          @click=${()=>this.selectToken(t)}
          variant="image"
          tabIdx=${(0,n.o)(e?-1:void 0)}
        >
          <wui-flex gap="1" alignItems="center">
            <wui-text variant="md-medium" color="primary">${t.name}</wui-text>
            <wui-text variant="sm-regular" color="secondary">${t.symbol}</wui-text>
          </wui-flex>
        </wui-list-item>
      `)}selectToken(e){e&&(a.ph.setPurchaseCurrency(e),l.I.close())}};E.styles=A,S([(0,o.SB)()],E.prototype,"selectedCurrency",void 0),S([(0,o.SB)()],E.prototype,"tokens",void 0),S([(0,o.SB)()],E.prototype,"tokenImages",void 0),S([(0,o.SB)()],E.prototype,"checked",void 0),E=S([(0,d.Mo)("w3m-onramp-token-select-view")],E);var I=r(29460),O=r(12858),B=r(82879);r(37826),r(12441),r(69804),r(7013);var j=(0,d.iv)`
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
`,T=function(e,t,r,i){var o,n=arguments.length,a=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,r,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(n<3?o(a):n>3?o(t,r,a):o(t,r))||a);return n>3&&a&&Object.defineProperty(t,r,a),a};let N=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.selectedOnRampProvider=a.ph.state.selectedProvider,this.uri=I.ConnectionController.state.wcUri,this.ready=!1,this.showRetry=!1,this.buffering=!1,this.error=!1,this.isMobile=!1,this.onRetry=void 0,this.unsubscribe.push(a.ph.subscribeKey("selectedProvider",e=>{this.selectedOnRampProvider=e}))}disconnectedCallback(){this.intervalId&&clearInterval(this.intervalId)}render(){let e="Continue in external window";this.error?e="Buy failed":this.selectedOnRampProvider&&(e=`Buy in ${this.selectedOnRampProvider?.label}`);let t=this.error?"Buy can be declined from your side or due to and error on the provider app":`We’ll notify you once your Buy is processed`;return(0,i.dy)`
      <wui-flex
        data-error=${(0,n.o)(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${["10","5","5","5"]}
        gap="5"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-visual
            name=${(0,n.o)(this.selectedOnRampProvider?.name)}
            size="lg"
            class="provider-image"
          >
          </wui-visual>

          ${this.error?null:this.loaderTemplate()}

          <wui-icon-box
            color="error"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>

        <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${["4","0","0","0"]}
        >
          <wui-text variant="md-medium" color=${this.error?"error":"primary"}>
            ${e}
          </wui-text>
          <wui-text align="center" variant="sm-medium" color="secondary">${t}</wui-text>
        </wui-flex>

        ${this.error?this.tryAgainTemplate():null}
      </wui-flex>

      <wui-flex .padding=${["0","5","5","5"]} justifyContent="center">
        <wui-link @click=${this.onCopyUri} color="secondary">
          <wui-icon size="sm" color="default" slot="iconLeft" name="copy"></wui-icon>
          Copy link
        </wui-link>
      </wui-flex>
    `}onTryAgain(){this.selectedOnRampProvider&&(this.error=!1,g.j.openHref(this.selectedOnRampProvider.url,"popupWindow","width=600,height=800,scrollbars=yes"))}tryAgainTemplate(){return this.selectedOnRampProvider?.url?(0,i.dy)`<wui-button size="md" variant="accent" @click=${this.onTryAgain.bind(this)}>
      <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
      Try again
    </wui-button>`:null}loaderTemplate(){let e=O.ThemeController.state.themeVariables["--w3m-border-radius-master"],t=e?parseInt(e.replace("px",""),10):4;return(0,i.dy)`<wui-loading-thumbnail radius=${9*t}></wui-loading-thumbnail>`}onCopyUri(){if(!this.selectedOnRampProvider?.url){B.SnackController.showError("No link found"),b.RouterController.goBack();return}try{g.j.copyToClopboard(this.selectedOnRampProvider.url),B.SnackController.showSuccess("Link copied")}catch{B.SnackController.showError("Failed to copy")}}};N.styles=j,T([(0,o.SB)()],N.prototype,"intervalId",void 0),T([(0,o.SB)()],N.prototype,"selectedOnRampProvider",void 0),T([(0,o.SB)()],N.prototype,"uri",void 0),T([(0,o.SB)()],N.prototype,"ready",void 0),T([(0,o.SB)()],N.prototype,"showRetry",void 0),T([(0,o.SB)()],N.prototype,"buffering",void 0),T([(0,o.SB)()],N.prototype,"error",void 0),T([(0,o.Cb)({type:Boolean})],N.prototype,"isMobile",void 0),T([(0,o.Cb)()],N.prototype,"onRetry",void 0),N=T([(0,d.Mo)("w3m-buy-in-progress-view")],N);let D=class extends i.oi{render(){return(0,i.dy)`
      <wui-flex
        flexDirection="column"
        .padding=${["6","10","5","10"]}
        alignItems="center"
        gap="5"
      >
        <wui-visual name="onrampCard"></wui-visual>
        <wui-flex flexDirection="column" gap="2" alignItems="center">
          <wui-text align="center" variant="md-medium" color="primary">
            Quickly and easily buy digital assets!
          </wui-text>
          <wui-text align="center" variant="sm-regular" color="secondary">
            Simply select your preferred onramp provider and add digital assets to your account
            using your credit card or bank transfer
          </wui-text>
        </wui-flex>
        <wui-button @click=${b.RouterController.goBack}>
          <wui-icon size="sm" color="inherit" name="add" slot="iconLeft"></wui-icon>
          Buy
        </wui-button>
      </wui-flex>
    `}};D=function(e,t,r,i){var o,n=arguments.length,a=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,r,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(n<3?o(a):n>3?o(t,r,a):o(t,r))||a);return n>3&&a&&Object.defineProperty(t,r,a),a}([(0,d.Mo)("w3m-what-is-a-buy-view")],D);var z=r(92103),L=r(47205),W=function(e,t,r,i){var o,n=arguments.length,a=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,r,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(n<3?o(a):n>3?o(t,r,a):o(t,r))||a);return n>3&&a&&Object.defineProperty(t,r,a),a};let U=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.activeCaipNetwork=y.R.state.activeCaipNetwork,this.features=u.OptionsController.state.features,this.remoteFeatures=u.OptionsController.state.remoteFeatures,this.exchangesLoading=z.u.state.isLoading,this.exchanges=z.u.state.exchanges,this.unsubscribe.push(u.OptionsController.subscribeKey("features",e=>this.features=e),u.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e),y.R.subscribeKey("activeCaipNetwork",e=>{this.activeCaipNetwork=e,this.setDefaultPaymentAsset()}),z.u.subscribeKey("isLoading",e=>this.exchangesLoading=e),z.u.subscribeKey("exchanges",e=>this.exchanges=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}async firstUpdated(){z.u.isPayWithExchangeSupported()&&(await this.setDefaultPaymentAsset(),await z.u.fetchExchanges())}render(){return(0,i.dy)`
      <wui-flex flexDirection="column" .padding=${["1","3","3","3"]} gap="2">
        ${this.onrampTemplate()} ${this.receiveTemplate()} ${this.depositFromExchangeTemplate()}
      </wui-flex>
    `}async setDefaultPaymentAsset(){if(!this.activeCaipNetwork)return;let e=await z.u.getAssetsForNetwork(this.activeCaipNetwork.caipNetworkId),t=e.find(e=>"USDC"===e.metadata.symbol)||e[0];t&&z.u.setPaymentAsset(t)}onrampTemplate(){if(!this.activeCaipNetwork)return null;let e=this.remoteFeatures?.onramp,t=L.bq.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(this.activeCaipNetwork.chainNamespace);return e&&t?(0,i.dy)`
      <wui-list-item
        @click=${this.onBuyCrypto.bind(this)}
        icon="card"
        data-testid="wallet-features-onramp-button"
      >
        <wui-text variant="lg-regular" color="primary">Buy crypto</wui-text>
      </wui-list-item>
    `:null}depositFromExchangeTemplate(){return this.activeCaipNetwork&&z.u.isPayWithExchangeSupported()?(0,i.dy)`
      <wui-list-item
        @click=${this.onDepositFromExchange.bind(this)}
        icon="arrowBottomCircle"
        data-testid="wallet-features-deposit-from-exchange-button"
        ?loading=${this.exchangesLoading}
        ?disabled=${this.exchangesLoading||!this.exchanges.length}
      >
        <wui-text variant="lg-regular" color="primary">Deposit from exchange</wui-text>
      </wui-list-item>
    `:null}receiveTemplate(){return this.features?.receive?(0,i.dy)`
      <wui-list-item
        @click=${this.onReceive.bind(this)}
        icon="qrCode"
        data-testid="wallet-features-receive-button"
      >
        <wui-text variant="lg-regular" color="primary">Receive funds</wui-text>
      </wui-list-item>
    `:null}onBuyCrypto(){b.RouterController.push("OnRampProviders")}onReceive(){b.RouterController.push("WalletReceive")}onDepositFromExchange(){b.RouterController.push("PayWithExchange")}};W([(0,o.SB)()],U.prototype,"activeCaipNetwork",void 0),W([(0,o.SB)()],U.prototype,"features",void 0),W([(0,o.SB)()],U.prototype,"remoteFeatures",void 0),W([(0,o.SB)()],U.prototype,"exchangesLoading",void 0),W([(0,o.SB)()],U.prototype,"exchanges",void 0),U=W([(0,d.Mo)("w3m-fund-wallet-view")],U),r(43722);var M=(0,d.iv)`
  :host {
    width: 100%;
  }

  wui-loading-spinner {
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
  }

  .currency-container {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${({spacing:e})=>e["2"]};
    height: 40px;
    padding: ${({spacing:e})=>e["2"]} ${({spacing:e})=>e["2"]}
      ${({spacing:e})=>e["2"]} ${({spacing:e})=>e["2"]};
    min-width: 95px;
    border-radius: ${({borderRadius:e})=>e.round};
    border: 1px solid ${({tokens:e})=>e.theme.foregroundPrimary};
    background: ${({tokens:e})=>e.theme.foregroundPrimary};
    cursor: pointer;
  }

  .currency-container > wui-image {
    height: 24px;
    width: 24px;
    border-radius: 50%;
  }
`,F=function(e,t,r,i){var o,n=arguments.length,a=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,r,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(n<3?o(a):n>3?o(t,r,a):o(t,r))||a);return n>3&&a&&Object.defineProperty(t,r,a),a};let K=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.type="Token",this.value=0,this.currencies=[],this.selectedCurrency=this.currencies?.[0],this.currencyImages=s.W.state.currencyImages,this.tokenImages=s.W.state.tokenImages,this.unsubscribe.push(a.ph.subscribeKey("purchaseCurrency",e=>{e&&"Fiat"!==this.type&&(this.selectedCurrency=this.formatPurchaseCurrency(e))}),a.ph.subscribeKey("paymentCurrency",e=>{e&&"Token"!==this.type&&(this.selectedCurrency=this.formatPaymentCurrency(e))}),a.ph.subscribe(e=>{"Fiat"===this.type?this.currencies=e.purchaseCurrencies.map(this.formatPurchaseCurrency):this.currencies=e.paymentCurrencies.map(this.formatPaymentCurrency)}),s.W.subscribe(e=>{this.currencyImages={...e.currencyImages},this.tokenImages={...e.tokenImages}}))}firstUpdated(){a.ph.getAvailableCurrencies()}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.selectedCurrency?.symbol||"",t=this.currencyImages[e]||this.tokenImages[e];return(0,i.dy)`<wui-input-text type="number" size="lg" value=${this.value}>
      ${this.selectedCurrency?(0,i.dy)` <wui-flex
            class="currency-container"
            justifyContent="space-between"
            alignItems="center"
            gap="1"
            @click=${()=>l.I.open({view:`OnRamp${this.type}Select`})}
          >
            <wui-image src=${(0,n.o)(t)}></wui-image>
            <wui-text color="primary">${this.selectedCurrency.symbol}</wui-text>
          </wui-flex>`:(0,i.dy)`<wui-loading-spinner></wui-loading-spinner>`}
    </wui-input-text>`}formatPaymentCurrency(e){return{name:e.id,symbol:e.id}}formatPurchaseCurrency(e){return{name:e.name,symbol:e.symbol}}};K.styles=M,F([(0,o.Cb)({type:String})],K.prototype,"type",void 0),F([(0,o.Cb)({type:Number})],K.prototype,"value",void 0),F([(0,o.SB)()],K.prototype,"currencies",void 0),F([(0,o.SB)()],K.prototype,"selectedCurrency",void 0),F([(0,o.SB)()],K.prototype,"currencyImages",void 0),F([(0,o.SB)()],K.prototype,"tokenImages",void 0),K=F([(0,d.Mo)("w3m-onramp-input")],K);var _=(0,d.iv)`
  :host > wui-flex {
    width: 100%;
    max-width: 360px;
  }

  :host > wui-flex > wui-flex {
    border-radius: ${({borderRadius:e})=>e["8"]};
    width: 100%;
  }

  .amounts-container {
    width: 100%;
  }
`,H=function(e,t,r,i){var o,n=arguments.length,a=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,r,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(n<3?o(a):n>3?o(t,r,a):o(t,r))||a);return n>3&&a&&Object.defineProperty(t,r,a),a};let V={USD:"$",EUR:"€",GBP:"\xa3"},q=[100,250,500,1e3],Y=class extends i.oi{constructor(){super(),this.unsubscribe=[],this.disabled=!1,this.caipAddress=y.R.state.activeCaipAddress,this.loading=l.I.state.loading,this.paymentCurrency=a.ph.state.paymentCurrency,this.paymentAmount=a.ph.state.paymentAmount,this.purchaseAmount=a.ph.state.purchaseAmount,this.quoteLoading=a.ph.state.quotesLoading,this.unsubscribe.push(y.R.subscribeKey("activeCaipAddress",e=>this.caipAddress=e),l.I.subscribeKey("loading",e=>{this.loading=e}),a.ph.subscribe(e=>{this.paymentCurrency=e.paymentCurrency,this.paymentAmount=e.paymentAmount,this.purchaseAmount=e.purchaseAmount,this.quoteLoading=e.quotesLoading}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return(0,i.dy)`
      <wui-flex flexDirection="column" justifyContent="center" alignItems="center">
        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <w3m-onramp-input
            type="Fiat"
            @inputChange=${this.onPaymentAmountChange.bind(this)}
            .value=${this.paymentAmount||0}
          ></w3m-onramp-input>
          <w3m-onramp-input
            type="Token"
            .value=${this.purchaseAmount||0}
            .loading=${this.quoteLoading}
          ></w3m-onramp-input>
          <wui-flex justifyContent="space-evenly" class="amounts-container" gap="2">
            ${q.map(e=>(0,i.dy)`<wui-button
                  variant=${this.paymentAmount===e?"accent-secondary":"neutral-secondary"}
                  size="md"
                  textVariant="md-medium"
                  fullWidth
                  @click=${()=>this.selectPresetAmount(e)}
                  >${`${V[this.paymentCurrency?.id||"USD"]} ${e}`}</wui-button
                >`)}
          </wui-flex>
          ${this.templateButton()}
        </wui-flex>
      </wui-flex>
    `}templateButton(){return this.caipAddress?(0,i.dy)`<wui-button
          @click=${this.getQuotes.bind(this)}
          variant="accent-primary"
          fullWidth
          size="lg"
          borderRadius="xs"
        >
          Get quotes
        </wui-button>`:(0,i.dy)`<wui-button
          @click=${this.openModal.bind(this)}
          variant="accent"
          fullWidth
          size="lg"
          borderRadius="xs"
        >
          Connect wallet
        </wui-button>`}getQuotes(){this.loading||l.I.open({view:"OnRampProviders"})}openModal(){l.I.open({view:"Connect"})}async onPaymentAmountChange(e){a.ph.setPaymentAmount(Number(e.detail)),await a.ph.getQuote()}async selectPresetAmount(e){a.ph.setPaymentAmount(e),await a.ph.getQuote()}};Y.styles=_,H([(0,o.Cb)({type:Boolean})],Y.prototype,"disabled",void 0),H([(0,o.SB)()],Y.prototype,"caipAddress",void 0),H([(0,o.SB)()],Y.prototype,"loading",void 0),H([(0,o.SB)()],Y.prototype,"paymentCurrency",void 0),H([(0,o.SB)()],Y.prototype,"paymentAmount",void 0),H([(0,o.SB)()],Y.prototype,"purchaseAmount",void 0),H([(0,o.SB)()],Y.prototype,"quoteLoading",void 0),Y=H([(0,d.Mo)("w3m-onramp-widget")],Y)},87809:function(e,t,r){r(31059)},43722:function(e,t,r){r(72785)},69804:function(e,t,r){var i=r(19064),o=r(59662);r(21927),r(79556);var n=r(24134),a=r(25729),s=r(95636),c=(0,s.iv)`
  button {
    border: none;
    background: transparent;
    height: 20px;
    padding: ${({spacing:e})=>e[2]};
    column-gap: ${({spacing:e})=>e[1]};
    border-radius: ${({borderRadius:e})=>e[1]};
    padding: 0 ${({spacing:e})=>e[1]};
    border-radius: ${({spacing:e})=>e[1]};
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-variant='accent'] {
    color: ${({tokens:e})=>e.core.textAccentPrimary};
  }

  button[data-variant='secondary'] {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  button[data-variant='accent']:focus-visible:enabled {
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  button[data-variant='secondary']:focus-visible:enabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button[data-variant='accent']:hover:enabled {
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  button[data-variant='secondary']:hover:enabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  button[data-variant='accent']:focus-visible {
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  button[data-variant='secondary']:focus-visible {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`,u=function(e,t,r,i){var o,n=arguments.length,a=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,r,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(n<3?o(a):n>3?o(t,r,a):o(t,r))||a);return n>3&&a&&Object.defineProperty(t,r,a),a};let l={sm:"sm-medium",md:"md-medium"},d={accent:"accent-primary",secondary:"secondary"},p=class extends i.oi{constructor(){super(...arguments),this.size="md",this.disabled=!1,this.variant="accent",this.icon=void 0}render(){return(0,i.dy)`
      <button ?disabled=${this.disabled} data-variant=${this.variant}>
        <slot name="iconLeft"></slot>
        <wui-text
          color=${d[this.variant]}
          variant=${l[this.size]}
        >
          <slot></slot>
        </wui-text>
        ${this.iconTemplate()}
      </button>
    `}iconTemplate(){return this.icon?(0,i.dy)`<wui-icon name=${this.icon} size="sm"></wui-icon>`:null}};p.styles=[n.ET,n.ZM,c],u([(0,o.Cb)()],p.prototype,"size",void 0),u([(0,o.Cb)({type:Boolean})],p.prototype,"disabled",void 0),u([(0,o.Cb)()],p.prototype,"variant",void 0),u([(0,o.Cb)()],p.prototype,"icon",void 0),u([(0,a.M)("wui-link")],p)},31059:function(e,t,r){var i=r(19064),o=r(59662),n=r(35162),a=r(24134),s=r(25729),c=r(95636),u=(0,c.iv)`
  :host {
    display: block;
    width: var(--local-width);
    height: var(--local-height);
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    border-radius: inherit;
    user-select: none;
    user-drag: none;
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
  }

  :host([data-boxed='true']) {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  :host([data-boxed='true']) img {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[16]};
  }

  :host([data-full='true']) img {
    width: 100%;
    height: 100%;
  }

  :host([data-boxed='true']) wui-icon {
    width: 20px;
    height: 20px;
  }

  :host([data-icon='error']) {
    background-color: ${({tokens:e})=>e.core.backgroundError};
  }

  :host([data-rounded='true']) {
    border-radius: ${({borderRadius:e})=>e[16]};
  }
`,l=function(e,t,r,i){var o,n=arguments.length,a=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,r,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(n<3?o(a):n>3?o(t,r,a):o(t,r))||a);return n>3&&a&&Object.defineProperty(t,r,a),a};let d=class extends i.oi{constructor(){super(...arguments),this.src="./path/to/image.jpg",this.alt="Image",this.size=void 0,this.boxed=!1,this.rounded=!1,this.fullSize=!1}render(){let e={inherit:"inherit",xxs:"2",xs:"3",sm:"4",md:"4",mdl:"5",lg:"5",xl:"6",xxl:"7","3xl":"8","4xl":"9","5xl":"10"};return(this.style.cssText=`
      --local-width: ${this.size?`var(--apkt-spacing-${e[this.size]});`:"100%"};
      --local-height: ${this.size?`var(--apkt-spacing-${e[this.size]});`:"100%"};
      `,this.dataset.boxed=this.boxed?"true":"false",this.dataset.rounded=this.rounded?"true":"false",this.dataset.full=this.fullSize?"true":"false",this.dataset.icon=this.iconColor||"inherit",this.icon)?(0,i.dy)`<wui-icon
        color=${this.iconColor||"inherit"}
        name=${this.icon}
        size="lg"
      ></wui-icon> `:this.logo?(0,i.dy)`<wui-icon size="lg" color="inherit" name=${this.logo}></wui-icon> `:(0,i.dy)`<img src=${(0,n.o)(this.src)} alt=${this.alt} @error=${this.handleImageError} />`}handleImageError(){this.dispatchEvent(new CustomEvent("onLoadError",{bubbles:!0,composed:!0}))}};d.styles=[a.ET,u],l([(0,o.Cb)()],d.prototype,"src",void 0),l([(0,o.Cb)()],d.prototype,"logo",void 0),l([(0,o.Cb)()],d.prototype,"icon",void 0),l([(0,o.Cb)()],d.prototype,"iconColor",void 0),l([(0,o.Cb)()],d.prototype,"alt",void 0),l([(0,o.Cb)()],d.prototype,"size",void 0),l([(0,o.Cb)({type:Boolean})],d.prototype,"boxed",void 0),l([(0,o.Cb)({type:Boolean})],d.prototype,"rounded",void 0),l([(0,o.Cb)({type:Boolean})],d.prototype,"fullSize",void 0),l([(0,s.M)("wui-image")],d)},72785:function(e,t,r){var i=r(19064),o=r(59662),n=r(35162),a=r(30183);r(21927),r(79556);var s=r(24134),c=r(25729),u=r(95636),l=(0,u.iv)`
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
`,d=function(e,t,r,i){var o,n=arguments.length,a=n<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,r):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,t,r,i);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(n<3?o(a):n>3?o(t,r,a):o(t,r))||a);return n>3&&a&&Object.defineProperty(t,r,a),a};let p=class extends i.oi{constructor(){super(...arguments),this.inputElementRef=(0,a.V)(),this.disabled=!1,this.loading=!1,this.placeholder="",this.type="text",this.value="",this.size="md"}render(){return(0,i.dy)` <div class="wui-input-text-container">
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
      ${this.templateError()} ${this.templateWarning()}`}templateLeftIcon(){return this.icon?(0,i.dy)`<wui-icon
        class="wui-input-text-left-icon"
        size="md"
        data-size=${this.size}
        color="inherit"
        name=${this.icon}
      ></wui-icon>`:null}templateSubmitButton(){return this.onSubmit?(0,i.dy)`<button
        class="wui-input-text-submit-button ${this.loading?"loading":""}"
        @click=${this.onSubmit?.bind(this)}
        ?disabled=${this.disabled||this.loading}
      >
        ${this.loading?(0,i.dy)`<wui-icon name="spinner" size="md"></wui-icon>`:(0,i.dy)`<wui-icon name="chevronRight" size="md"></wui-icon>`}
      </button>`:null}templateError(){return this.errorText?(0,i.dy)`<wui-text variant="sm-regular" color="error">${this.errorText}</wui-text>`:null}templateWarning(){return this.warningText?(0,i.dy)`<wui-text variant="sm-regular" color="warning">${this.warningText}</wui-text>`:null}dispatchInputChangeEvent(){this.dispatchEvent(new CustomEvent("inputChange",{detail:this.inputElementRef.value?.value,bubbles:!0,composed:!0}))}};p.styles=[s.ET,s.ZM,l],d([(0,o.Cb)()],p.prototype,"icon",void 0),d([(0,o.Cb)({type:Boolean})],p.prototype,"disabled",void 0),d([(0,o.Cb)({type:Boolean})],p.prototype,"loading",void 0),d([(0,o.Cb)()],p.prototype,"placeholder",void 0),d([(0,o.Cb)()],p.prototype,"type",void 0),d([(0,o.Cb)()],p.prototype,"value",void 0),d([(0,o.Cb)()],p.prototype,"errorText",void 0),d([(0,o.Cb)()],p.prototype,"warningText",void 0),d([(0,o.Cb)()],p.prototype,"onSubmit",void 0),d([(0,o.Cb)()],p.prototype,"size",void 0),d([(0,o.Cb)({attribute:!1})],p.prototype,"onKeyDown",void 0),d([(0,c.M)("wui-input-text")],p)}}]);