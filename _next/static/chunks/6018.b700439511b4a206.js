"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6018],{92103:function(t,e,i){i.d(e,{u:function(){return f}});var o=i(86949),n=i(73932),r=i(62411),a=i(18462),s=i(47205),u=i(83241),c=i(49774),l=i(83966),d=i(66691),p=i(59757),h=i(51440),m=i(77500),g=i(82879);let y={paymentAsset:null,amount:null,tokenAmount:0,priceLoading:!1,error:null,exchanges:[],isLoading:!1,currentPayment:void 0,isPaymentInProgress:!1,paymentId:"",assets:[]},b=(0,o.sj)(y),f={state:b,subscribe:t=>(0,o.Ld)(b,()=>t(b)),subscribeKey:(t,e)=>(0,n.VW)(b,t,e),resetState(){Object.assign(b,{...y})},async getAssetsForNetwork(t){let e=(0,c.ec)(t),i=await f.getAssetsImageAndPrice(e),o=e.map(t=>{let e="native"===t.asset?(0,a.EO)():`${t.network}:${t.asset}`,o=i.find(t=>t.fungibles?.[0]?.address?.toLowerCase()===e.toLowerCase());return{...t,price:o?.fungibles?.[0]?.price||1,metadata:{...t.metadata,iconUrl:o?.fungibles?.[0]?.iconUrl}}});return b.assets=o,o},async getAssetsImageAndPrice(t){let e=t.map(t=>"native"===t.asset?(0,a.EO)():`${t.network}:${t.asset}`);return await Promise.all(e.map(t=>d.L.fetchTokenPrice({addresses:[t]})))},getTokenAmount(){if(!b?.paymentAsset?.price)throw Error("Cannot get token price");let t=r.C.bigNumber(b.amount??0).round(8),e=r.C.bigNumber(b.paymentAsset.price).round(8);return t.div(e).round(8).toNumber()},setAmount(t){b.amount=t,b.paymentAsset?.price&&(b.tokenAmount=f.getTokenAmount())},setPaymentAsset(t){b.paymentAsset=t},isPayWithExchangeEnabled:()=>m.OptionsController.state.remoteFeatures?.payWithExchange||m.OptionsController.state.remoteFeatures?.payments||m.OptionsController.state.features?.pay,isPayWithExchangeSupported:()=>f.isPayWithExchangeEnabled()&&p.R.state.activeCaipNetwork&&s.bq.PAY_WITH_EXCHANGE_SUPPORTED_CHAIN_NAMESPACES.includes(p.R.state.activeCaipNetwork.chainNamespace),async fetchExchanges(){try{let t=f.isPayWithExchangeSupported();if(!b.paymentAsset||!t){b.exchanges=[],b.isLoading=!1;return}b.isLoading=!0;let e=await (0,c.YK)({page:0,asset:(0,c.Us)(b.paymentAsset.network,b.paymentAsset.asset),amount:b.amount?.toString()??"0"});b.exchanges=e.exchanges.slice(0,2)}catch(t){throw g.SnackController.showError("Unable to get exchanges"),Error("Unable to get exchanges")}finally{b.isLoading=!1}},async getPayUrl(t,e){try{let i=Number(e.amount),o=await (0,c.kv)({exchangeId:t,asset:(0,c.Us)(e.network,e.asset),amount:i.toString(),recipient:`${e.network}:${e.recipient}`});return h.X.sendEvent({type:"track",event:"PAY_EXCHANGE_SELECTED",properties:{exchange:{id:t},configuration:{network:e.network,asset:e.asset,recipient:e.recipient,amount:i},currentPayment:{type:"exchange",exchangeId:t},source:"fund-from-exchange",headless:!1}}),o}catch(t){if(t instanceof Error&&t.message.includes("is not supported"))throw Error("Asset not supported");throw Error(t.message)}},async handlePayWithExchange(t){try{if(!l.AccountController.state.address)throw Error("No account connected");if(!b.paymentAsset)throw Error("No payment asset selected");let e=u.j.returnOpenHref("","popupWindow","scrollbar=yes,width=480,height=720");if(!e)throw Error("Could not create popup window");b.isPaymentInProgress=!0,b.paymentId=crypto.randomUUID(),b.currentPayment={type:"exchange",exchangeId:t};let{network:i,asset:o}=b.paymentAsset,n={network:i,asset:o,amount:b.tokenAmount,recipient:l.AccountController.state.address},r=await f.getPayUrl(t,n);if(!r){try{e.close()}catch(t){console.error("Unable to close popup window",t)}throw Error("Unable to initiate payment")}b.currentPayment.sessionId=r.sessionId,b.currentPayment.status="IN_PROGRESS",b.currentPayment.exchangeId=t,e.location.href=r.url}catch(t){b.error="Unable to initiate payment",g.SnackController.showError(b.error)}},async waitUntilComplete({exchangeId:t,sessionId:e,paymentId:i,retries:o=20}){let n=await f.getBuyStatus(t,e,i);if("SUCCESS"===n.status||"FAILED"===n.status)return n;if(0===o)throw Error("Unable to get deposit status");return await new Promise(t=>{setTimeout(t,5e3)}),f.waitUntilComplete({exchangeId:t,sessionId:e,paymentId:i,retries:o-1})},async getBuyStatus(t,e,i){try{if(!b.currentPayment)throw Error("No current payment");let o=await (0,c.Cx)({sessionId:e,exchangeId:t});return b.currentPayment.status=o.status,("SUCCESS"===o.status||"FAILED"===o.status)&&(b.currentPayment.result=o.txHash,b.isPaymentInProgress=!1,h.X.sendEvent({type:"track",event:"SUCCESS"===o.status?"PAY_SUCCESS":"PAY_ERROR",properties:{message:"FAILED"===o.status?u.j.parseError(b.error):void 0,source:"fund-from-exchange",paymentId:i,configuration:{network:b.paymentAsset?.network||"",asset:b.paymentAsset?.asset||"",recipient:l.AccountController.state.address||"",amount:b.amount??0},currentPayment:{type:"exchange",exchangeId:b.currentPayment?.exchangeId,sessionId:b.currentPayment?.sessionId,result:o.txHash}}})),o}catch(t){return{status:"UNKNOWN",txHash:""}}},reset(){b.currentPayment=void 0,b.isPaymentInProgress=!1,b.paymentId="",b.paymentAsset=null,b.amount=0,b.tokenAmount=0,b.priceLoading=!1,b.error=null,b.exchanges=[],b.isLoading=!1}}},46018:function(t,e,i){i.r(e),i.d(e,{W3mDepositFromExchangeSelectAssetView:function(){return E},W3mDepositFromExchangeView:function(){return P}});var o=i(19064),n=i(59662),r=i(59757),a=i(92103),s=i(4511),u=i(82879),c=i(83966),l=i(29460),d=i(28740);i(21927),i(31059),i(79556);var p=i(24134),h=i(25729),m=i(95636),g=(0,m.iv)`
  button {
    border: none;
    border-radius: ${({borderRadius:t})=>t["20"]};
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: ${({spacing:t})=>t[1]};
    transition:
      background-color ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]},
      box-shadow ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]};
    will-change: background-color, box-shadow;
  }

  /* -- Variants --------------------------------------------------------------- */
  button[data-type='accent'] {
    background-color: ${({tokens:t})=>t.core.backgroundAccentPrimary};
    color: ${({tokens:t})=>t.theme.textPrimary};
  }

  button[data-type='neutral'] {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    color: ${({tokens:t})=>t.theme.textPrimary};
  }

  /* -- Sizes --------------------------------------------------------------- */
  button[data-size='sm'] {
    height: 24px;
  }

  button[data-size='md'] {
    height: 28px;
  }

  button[data-size='lg'] {
    height: 32px;
  }

  button[data-size='sm'] > wui-image,
  button[data-size='sm'] > wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='md'] > wui-image,
  button[data-size='md'] > wui-icon {
    width: 20px;
    height: 20px;
  }

  button[data-size='lg'] > wui-image,
  button[data-size='lg'] > wui-icon {
    width: 24px;
    height: 24px;
  }

  wui-text {
    padding-left: ${({spacing:t})=>t[1]};
    padding-right: ${({spacing:t})=>t[1]};
  }

  wui-image {
    border-radius: ${({borderRadius:t})=>t[3]};
    overflow: hidden;
    user-drag: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-drag: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }

  /* -- States --------------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    button[data-type='accent']:not(:disabled):hover {
      background-color: ${({tokens:t})=>t.core.foregroundAccent060};
    }

    button[data-type='neutral']:not(:disabled):hover {
      background-color: ${({tokens:t})=>t.theme.foregroundTertiary};
    }
  }

  button[data-type='accent']:not(:disabled):focus-visible,
  button[data-type='accent']:not(:disabled):active {
    box-shadow: 0 0 0 4px ${({tokens:t})=>t.core.foregroundAccent020};
  }

  button[data-type='neutral']:not(:disabled):focus-visible,
  button[data-type='neutral']:not(:disabled):active {
    box-shadow: 0 0 0 4px ${({tokens:t})=>t.core.foregroundAccent020};
  }

  button:disabled {
    opacity: 0.5;
  }
`,y=function(t,e,i,o){var n,r=arguments.length,a=r<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,o);else for(var s=t.length-1;s>=0;s--)(n=t[s])&&(a=(r<3?n(a):r>3?n(e,i,a):n(e,i))||a);return r>3&&a&&Object.defineProperty(e,i,a),a};let b={sm:"sm-regular",md:"md-regular",lg:"lg-regular"},f=class extends o.oi{constructor(){super(...arguments),this.type="accent",this.size="md",this.imageSrc="",this.disabled=!1,this.leftIcon=void 0,this.rightIcon=void 0,this.text=""}render(){return(0,o.dy)`
      <button ?disabled=${this.disabled} data-type=${this.type} data-size=${this.size}>
        ${this.imageSrc?(0,o.dy)`<wui-image src=${this.imageSrc}></wui-image>`:null}
        ${this.leftIcon?(0,o.dy)`<wui-icon name=${this.leftIcon} color="inherit" size="inherit"></wui-icon>`:null}
        <wui-text variant=${b[this.size]} color="inherit">${this.text}</wui-text>
        ${this.rightIcon?(0,o.dy)`<wui-icon name=${this.rightIcon} color="inherit" size="inherit"></wui-icon>`:null}
      </button>
    `}};f.styles=[p.ET,p.ZM,g],y([(0,n.Cb)()],f.prototype,"type",void 0),y([(0,n.Cb)()],f.prototype,"size",void 0),y([(0,n.Cb)()],f.prototype,"imageSrc",void 0),y([(0,n.Cb)({type:Boolean})],f.prototype,"disabled",void 0),y([(0,n.Cb)()],f.prototype,"leftIcon",void 0),y([(0,n.Cb)()],f.prototype,"rightIcon",void 0),y([(0,n.Cb)()],f.prototype,"text",void 0),f=y([(0,h.M)("wui-chip-button")],f),i(82100),i(8035),i(87809),i(84350),i(91833),i(68390);var w=i(35162);i(37826),i(27058),i(69804);var x=function(t,e,i,o){var n,r=arguments.length,a=r<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,o);else for(var s=t.length-1;s>=0;s--)(n=t[s])&&(a=(r<3?n(a):r>3?n(e,i,a):n(e,i))||a);return r>3&&a&&Object.defineProperty(e,i,a),a};let v=class extends o.oi{constructor(){super(...arguments),this.maxDecimals=void 0,this.maxIntegers=void 0}render(){return(0,o.dy)`
      <wui-flex alignItems="center" gap="1">
        <wui-input-amount
          widthVariant="fit"
          fontSize="h2"
          .maxDecimals=${(0,w.o)(this.maxDecimals)}
          .maxIntegers=${(0,w.o)(this.maxIntegers)}
          .value=${this.amount?String(this.amount):""}
        ></wui-input-amount>
        <wui-text variant="md-regular" color="secondary">USD</wui-text>
      </wui-flex>
    `}};x([(0,n.Cb)({type:Number})],v.prototype,"amount",void 0),x([(0,n.Cb)({type:Number})],v.prototype,"maxDecimals",void 0),x([(0,n.Cb)({type:Number})],v.prototype,"maxIntegers",void 0),v=x([(0,d.Mo)("w3m-fund-input")],v);var $=(0,d.iv)`
  .amount-input-container {
    border-radius: ${({borderRadius:t})=>t["6"]};
    border-top-right-radius: 0;
    border-top-left-radius: 0;
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    padding: ${({spacing:t})=>t[1]};
  }

  .container {
    border-radius: 30px;
  }
`,C=function(t,e,i,o){var n,r=arguments.length,a=r<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,o);else for(var s=t.length-1;s>=0;s--)(n=t[s])&&(a=(r<3?n(a):r>3?n(e,i,a):n(e,i))||a);return r>3&&a&&Object.defineProperty(e,i,a),a};let k=[10,50,100],P=class extends o.oi{constructor(){super(),this.unsubscribe=[],this.network=r.R.state.activeCaipNetwork,this.exchanges=a.u.state.exchanges,this.isLoading=a.u.state.isLoading,this.amount=a.u.state.amount,this.tokenAmount=a.u.state.tokenAmount,this.priceLoading=a.u.state.priceLoading,this.isPaymentInProgress=a.u.state.isPaymentInProgress,this.currentPayment=a.u.state.currentPayment,this.paymentId=a.u.state.paymentId,this.paymentAsset=a.u.state.paymentAsset,this.unsubscribe.push(r.R.subscribeKey("activeCaipNetwork",t=>{this.network=t,this.setDefaultPaymentAsset()}),a.u.subscribe(t=>{this.exchanges=t.exchanges,this.isLoading=t.isLoading,this.amount=t.amount,this.tokenAmount=t.tokenAmount,this.priceLoading=t.priceLoading,this.paymentId=t.paymentId,this.isPaymentInProgress=t.isPaymentInProgress,this.currentPayment=t.currentPayment,this.paymentAsset=t.paymentAsset,t.isPaymentInProgress&&t.currentPayment?.exchangeId&&t.currentPayment?.sessionId&&t.paymentId&&this.handlePaymentInProgress()}))}disconnectedCallback(){this.unsubscribe.forEach(t=>t()),a.u.reset()}async firstUpdated(){await this.getPaymentAssets(),this.paymentAsset||await this.setDefaultPaymentAsset(),a.u.setAmount(k[0]),await a.u.fetchExchanges()}render(){return(0,o.dy)`
      <wui-flex flexDirection="column" class="container">
        ${this.amountInputTemplate()} ${this.exchangesTemplate()}
      </wui-flex>
    `}exchangesLoadingTemplate(){return Array.from({length:2}).map(()=>(0,o.dy)`<wui-shimmer width="100%" height="65px" borderRadius="xxs"></wui-shimmer>`)}_exchangesTemplate(){return this.exchanges.length>0?this.exchanges.map(t=>(0,o.dy)`<wui-list-item
              @click=${()=>this.onExchangeClick(t)}
              chevron
              variant="image"
              imageSrc=${t.imageUrl}
              ?loading=${this.isLoading}
            >
              <wui-text variant="md-regular" color="primary">
                Deposit from ${t.name}
              </wui-text>
            </wui-list-item>`):(0,o.dy)`<wui-flex flexDirection="column" alignItems="center" gap="4" padding="4">
          <wui-text variant="lg-medium" align="center" color="primary">
            No exchanges support this asset on this network
          </wui-text>
        </wui-flex>`}exchangesTemplate(){return(0,o.dy)`<wui-flex
      flexDirection="column"
      gap="2"
      .padding=${["3","3","3","3"]}
      class="exchanges-container"
    >
      ${this.isLoading?this.exchangesLoadingTemplate():this._exchangesTemplate()}
    </wui-flex>`}amountInputTemplate(){return(0,o.dy)`
      <wui-flex
        flexDirection="column"
        .padding=${["0","3","3","3"]}
        class="amount-input-container"
      >
        <wui-flex
          justifyContent="space-between"
          alignItems="center"
          .margin=${["0","0","6","0"]}
        >
          <wui-text variant="md-medium" color="secondary">Asset</wui-text>
          <wui-token-button
            data-testid="deposit-from-exchange-asset-button"
            flexDirection="row-reverse"
            text=${this.paymentAsset?.metadata.symbol||""}
            imageSrc=${this.paymentAsset?.metadata.iconUrl||""}
            @click=${()=>s.RouterController.push("PayWithExchangeSelectAsset")}
            size="lg"
          >
          </wui-token-button>
        </wui-flex>
        <wui-flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          .margin=${["0","0","4","0"]}
        >
          <w3m-fund-input
            @inputChange=${this.onAmountChange.bind(this)}
            .amount=${this.amount}
            .maxDecimals=${6}
            .maxIntegers=${10}
          >
          </w3m-fund-input>
          ${this.tokenAmountTemplate()}
        </wui-flex>
        <wui-flex justifyContent="center" gap="2">
          ${k.map(t=>(0,o.dy)`<wui-chip-button
                @click=${()=>a.u.setAmount(t)}
                type="neutral"
                size="lg"
                text=${`$${t}`}
              ></wui-chip-button>`)}
        </wui-flex>
      </wui-flex>
    `}tokenAmountTemplate(){return this.priceLoading?(0,o.dy)`<wui-shimmer
        width="65px"
        height="20px"
        borderRadius="xxs"
        variant="light"
      ></wui-shimmer>`:(0,o.dy)`
      <wui-text variant="md-regular" color="secondary">
        ${this.tokenAmount.toFixed(4)} ${this.paymentAsset?.metadata.symbol}
      </wui-text>
    `}async onExchangeClick(t){if(!this.amount){u.SnackController.showError("Please enter an amount");return}await a.u.handlePayWithExchange(t.id)}handlePaymentInProgress(){let t=r.R.state.activeChain;this.isPaymentInProgress&&this.currentPayment?.exchangeId&&this.currentPayment?.sessionId&&this.paymentId&&(a.u.waitUntilComplete({exchangeId:this.currentPayment.exchangeId,sessionId:this.currentPayment.sessionId,paymentId:this.paymentId}).then(e=>{"SUCCESS"===e.status?(u.SnackController.showSuccess("Deposit completed"),t&&(c.AccountController.fetchTokenBalance(),l.ConnectionController.updateBalance(t))):"FAILED"===e.status&&u.SnackController.showError("Deposit failed")}),u.SnackController.showLoading("Deposit in progress..."),s.RouterController.replace("Account"))}onAmountChange({detail:t}){a.u.setAmount(t?Number(t):null)}async getPaymentAssets(){this.network&&await a.u.getAssetsForNetwork(this.network.caipNetworkId)}async setDefaultPaymentAsset(){if(this.network){let t=await a.u.getAssetsForNetwork(this.network.caipNetworkId);t[0]&&a.u.setPaymentAsset(t[0])}}};P.styles=$,C([(0,n.SB)()],P.prototype,"network",void 0),C([(0,n.SB)()],P.prototype,"exchanges",void 0),C([(0,n.SB)()],P.prototype,"isLoading",void 0),C([(0,n.SB)()],P.prototype,"amount",void 0),C([(0,n.SB)()],P.prototype,"tokenAmount",void 0),C([(0,n.SB)()],P.prototype,"priceLoading",void 0),C([(0,n.SB)()],P.prototype,"isPaymentInProgress",void 0),C([(0,n.SB)()],P.prototype,"currentPayment",void 0),C([(0,n.SB)()],P.prototype,"paymentId",void 0),C([(0,n.SB)()],P.prototype,"paymentAsset",void 0),P=C([(0,d.Mo)("w3m-deposit-from-exchange-view")],P);var I=i(83241);i(85642),i(12441),i(43722),i(87204),i(69393);var A=(0,d.iv)`
  .contentContainer {
    height: 440px;
    overflow: scroll;
    scrollbar-width: none;
  }

  .contentContainer::-webkit-scrollbar {
    display: none;
  }

  wui-icon-box {
    width: 40px;
    height: 40px;
    border-radius: ${({borderRadius:t})=>t["3"]};
  }
`,S=function(t,e,i,o){var n,r=arguments.length,a=r<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,o);else for(var s=t.length-1;s>=0;s--)(n=t[s])&&(a=(r<3?n(a):r>3?n(e,i,a):n(e,i))||a);return r>3&&a&&Object.defineProperty(e,i,a),a};let E=class extends o.oi{constructor(){super(),this.unsubscribe=[],this.assets=a.u.state.assets,this.search="",this.onDebouncedSearch=I.j.debounce(t=>{this.search=t}),this.unsubscribe.push(a.u.subscribe(t=>{this.assets=t.assets}))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){return(0,o.dy)`
      <wui-flex flexDirection="column">
        ${this.templateSearchInput()} <wui-separator></wui-separator> ${this.templateTokens()}
      </wui-flex>
    `}templateSearchInput(){return(0,o.dy)`
      <wui-flex gap="2" padding="3">
        <wui-input-text
          @inputChange=${this.onInputChange.bind(this)}
          class="network-search-input"
          size="sm"
          placeholder="Search token"
          icon="search"
        ></wui-input-text>
      </wui-flex>
    `}templateTokens(){let t=this.assets.filter(t=>t.metadata.name.toLowerCase().includes(this.search.toLowerCase())),e=t.length>0;return(0,o.dy)`
      <wui-flex
        class="contentContainer"
        flexDirection="column"
        .padding=${["0","3","0","3"]}
      >
        <wui-flex justifyContent="flex-start" .padding=${["4","3","3","3"]}>
          <wui-text variant="md-medium" color="secondary">Available tokens</wui-text>
        </wui-flex>
        <wui-flex flexDirection="column" gap="2">
          ${e?t.map(t=>(0,o.dy)`<wui-list-item
                    .imageSrc=${t.metadata.iconUrl}
                    ?clickable=${!0}
                    @click=${this.handleTokenClick.bind(this,t)}
                  >
                    <wui-text variant="md-medium" color="primary">${t.metadata.name}</wui-text>
                    <wui-text variant="md-regular" color="secondary"
                      >${t.metadata.symbol}</wui-text
                    >
                  </wui-list-item>`):(0,o.dy)`<wui-flex
                .padding=${["20","0","0","0"]}
                alignItems="center"
                flexDirection="column"
                gap="4"
              >
                <wui-icon-box icon="coinPlaceholder" color="default" size="lg"></wui-icon-box>
                <wui-flex
                  class="textContent"
                  gap="2"
                  flexDirection="column"
                  justifyContent="center"
                >
                  <wui-text variant="lg-medium" align="center" color="primary">
                    No tokens found
                  </wui-text>
                </wui-flex>
                <wui-link @click=${this.onBuyClick.bind(this)}>Buy</wui-link>
              </wui-flex>`}
        </wui-flex>
      </wui-flex>
    `}onBuyClick(){s.RouterController.push("OnRampProviders")}onInputChange(t){this.onDebouncedSearch(t.detail)}handleTokenClick(t){a.u.setPaymentAsset(t),s.RouterController.goBack()}};E.styles=A,S([(0,n.SB)()],E.prototype,"assets",void 0),S([(0,n.SB)()],E.prototype,"search",void 0),E=S([(0,d.Mo)("w3m-deposit-from-exchange-select-asset-view")],E)},8035:function(t,e,i){i(42672)},85642:function(t,e,i){i(21927)},87809:function(t,e,i){i(31059)},27058:function(t,e,i){var o=i(19064),n=i(59662),r=i(30183),a=i(95636),s=i(24134),u=i(1512),c=i(25729),l=(0,a.iv)`
  :host {
    position: relative;
    display: inline-block;
  }

  input {
    background: transparent;
    height: auto;
    box-sizing: border-box;
    color: ${({tokens:t})=>t.theme.textPrimary};
    font-feature-settings: 'case' on;
    font-size: var(--local-font-size);
    caret-color: ${({tokens:t})=>t.core.textAccentPrimary};
    line-height: 130%;
    letter-spacing: -1.28px;
    -webkit-appearance: none;
    -moz-appearance: textfield;
    padding: 0px;
    font-family: ${({fontFamily:t})=>t.mono};
  }

  :host([data-width-variant='auto']) input {
    width: 100%;
  }

  :host([data-width-variant='fit']) input {
    width: 1ch;
  }

  .wui-input-amount-fit-mirror {
    position: absolute;
    visibility: hidden;
    white-space: pre;
    font-size: var(--local-font-size);
    line-height: 130%;
    letter-spacing: -1.28px;
    font-family: ${({fontFamily:t})=>t.mono};
  }

  .wui-input-amount-fit-width {
    display: inline-block;
    position: relative;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input::placeholder {
    color: ${({tokens:t})=>t.theme.foregroundTertiary};
  }
`,d=function(t,e,i,o){var n,r=arguments.length,a=r<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,o);else for(var s=t.length-1;s>=0;s--)(n=t[s])&&(a=(r<3?n(a):r>3?n(e,i,a):n(e,i))||a);return r>3&&a&&Object.defineProperty(e,i,a),a};let p=class extends o.oi{constructor(){super(...arguments),this.inputElementRef=(0,r.V)(),this.disabled=!1,this.value="",this.placeholder="0",this.widthVariant="auto",this.maxDecimals=void 0,this.maxIntegers=void 0,this.fontSize="h4"}firstUpdated(){this.resizeInput()}updated(){this.style.setProperty("--local-font-size",a.gR.textSize[this.fontSize]),this.resizeInput()}render(){return(this.dataset.widthVariant=this.widthVariant,this.inputElementRef?.value&&this.value&&(this.inputElementRef.value.value=this.value),"auto"===this.widthVariant)?this.inputTemplate():(0,o.dy)`
      <div class="wui-input-amount-fit-width">
        <span class="wui-input-amount-fit-mirror"></span>
        ${this.inputTemplate()}
      </div>
    `}inputTemplate(){return(0,o.dy)`<input
      ${(0,r.i)(this.inputElementRef)}
      type="text"
      inputmode="decimal"
      pattern="[0-9,.]*"
      placeholder=${this.placeholder}
      ?disabled=${this.disabled}
      autofocus
      value=${this.value??""}
      @input=${this.dispatchInputChangeEvent.bind(this)}
    />`}dispatchInputChangeEvent(){this.inputElementRef.value&&(this.inputElementRef.value.value=u.H.maskInput({value:this.inputElementRef.value.value,decimals:this.maxDecimals,integers:this.maxIntegers}),this.dispatchEvent(new CustomEvent("inputChange",{detail:this.inputElementRef.value.value,bubbles:!0,composed:!0})),this.resizeInput())}resizeInput(){if("fit"===this.widthVariant){let t=this.inputElementRef.value;if(t){let e=t.previousElementSibling;e&&(e.textContent=t.value||"0",t.style.width=`${e.offsetWidth}px`)}}}};p.styles=[s.ET,s.ZM,l],d([(0,n.Cb)({type:Boolean})],p.prototype,"disabled",void 0),d([(0,n.Cb)({type:String})],p.prototype,"value",void 0),d([(0,n.Cb)({type:String})],p.prototype,"placeholder",void 0),d([(0,n.Cb)({type:String})],p.prototype,"widthVariant",void 0),d([(0,n.Cb)({type:Number})],p.prototype,"maxDecimals",void 0),d([(0,n.Cb)({type:Number})],p.prototype,"maxIntegers",void 0),d([(0,n.Cb)({type:String})],p.prototype,"fontSize",void 0),d([(0,c.M)("wui-input-amount")],p)},84350:function(t,e,i){var o=i(19064),n=i(59662),r=i(35162);i(51243),i(79556);var a=i(24134),s=i(25729),u=i(95636),c=(0,u.iv)`
  :host {
    width: 100%;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({spacing:t})=>t[3]};
    width: 100%;
    background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
    border-radius: ${({borderRadius:t})=>t[4]};
    transition:
      background-color ${({durations:t})=>t.lg}
        ${({easings:t})=>t["ease-out-power-2"]},
      scale ${({durations:t})=>t.lg} ${({easings:t})=>t["ease-out-power-2"]};
    will-change: background-color, scale;
  }

  wui-text {
    text-transform: capitalize;
  }

  wui-image {
    color: ${({tokens:t})=>t.theme.textPrimary};
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    }
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`,l=function(t,e,i,o){var n,r=arguments.length,a=r<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,o);else for(var s=t.length-1;s>=0;s--)(n=t[s])&&(a=(r<3?n(a):r>3?n(e,i,a):n(e,i))||a);return r>3&&a&&Object.defineProperty(e,i,a),a};let d=class extends o.oi{constructor(){super(...arguments),this.imageSrc="google",this.loading=!1,this.disabled=!1,this.rightIcon=!0,this.rounded=!1,this.fullSize=!1}render(){return this.dataset.rounded=this.rounded?"true":"false",(0,o.dy)`
      <button
        ?disabled=${!!this.loading||!!this.disabled}
        data-loading=${this.loading}
        tabindex=${(0,r.o)(this.tabIdx)}
      >
        <wui-flex gap="2" alignItems="center">
          ${this.templateLeftIcon()}
          <wui-flex gap="1">
            <slot></slot>
          </wui-flex>
        </wui-flex>
        ${this.templateRightIcon()}
      </button>
    `}templateLeftIcon(){return this.icon?(0,o.dy)`<wui-image
        icon=${this.icon}
        iconColor=${(0,r.o)(this.iconColor)}
        ?boxed=${!0}
        ?rounded=${this.rounded}
      ></wui-image>`:(0,o.dy)`<wui-image
      ?boxed=${!0}
      ?rounded=${this.rounded}
      ?fullSize=${this.fullSize}
      src=${this.imageSrc}
    ></wui-image>`}templateRightIcon(){return this.rightIcon?this.loading?(0,o.dy)`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:(0,o.dy)`<wui-icon name="chevronRight" size="lg" color="default"></wui-icon>`:null}};d.styles=[a.ET,a.ZM,c],l([(0,n.Cb)()],d.prototype,"imageSrc",void 0),l([(0,n.Cb)()],d.prototype,"icon",void 0),l([(0,n.Cb)()],d.prototype,"iconColor",void 0),l([(0,n.Cb)({type:Boolean})],d.prototype,"loading",void 0),l([(0,n.Cb)()],d.prototype,"tabIdx",void 0),l([(0,n.Cb)({type:Boolean})],d.prototype,"disabled",void 0),l([(0,n.Cb)({type:Boolean})],d.prototype,"rightIcon",void 0),l([(0,n.Cb)({type:Boolean})],d.prototype,"rounded",void 0),l([(0,n.Cb)({type:Boolean})],d.prototype,"fullSize",void 0),l([(0,s.M)("wui-list-item")],d)},91833:function(t,e,i){i(22584)},31059:function(t,e,i){var o=i(19064),n=i(59662),r=i(35162),a=i(24134),s=i(25729),u=i(95636),c=(0,u.iv)`
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
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    border-radius: ${({borderRadius:t})=>t[2]};
  }

  :host([data-boxed='true']) img {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:t})=>t[16]};
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
    background-color: ${({tokens:t})=>t.core.backgroundError};
  }

  :host([data-rounded='true']) {
    border-radius: ${({borderRadius:t})=>t[16]};
  }
`,l=function(t,e,i,o){var n,r=arguments.length,a=r<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,o);else for(var s=t.length-1;s>=0;s--)(n=t[s])&&(a=(r<3?n(a):r>3?n(e,i,a):n(e,i))||a);return r>3&&a&&Object.defineProperty(e,i,a),a};let d=class extends o.oi{constructor(){super(...arguments),this.src="./path/to/image.jpg",this.alt="Image",this.size=void 0,this.boxed=!1,this.rounded=!1,this.fullSize=!1}render(){let t={inherit:"inherit",xxs:"2",xs:"3",sm:"4",md:"4",mdl:"5",lg:"5",xl:"6",xxl:"7","3xl":"8","4xl":"9","5xl":"10"};return(this.style.cssText=`
      --local-width: ${this.size?`var(--apkt-spacing-${t[this.size]});`:"100%"};
      --local-height: ${this.size?`var(--apkt-spacing-${t[this.size]});`:"100%"};
      `,this.dataset.boxed=this.boxed?"true":"false",this.dataset.rounded=this.rounded?"true":"false",this.dataset.full=this.fullSize?"true":"false",this.dataset.icon=this.iconColor||"inherit",this.icon)?(0,o.dy)`<wui-icon
        color=${this.iconColor||"inherit"}
        name=${this.icon}
        size="lg"
      ></wui-icon> `:this.logo?(0,o.dy)`<wui-icon size="lg" color="inherit" name=${this.logo}></wui-icon> `:(0,o.dy)`<img src=${(0,r.o)(this.src)} alt=${this.alt} @error=${this.handleImageError} />`}handleImageError(){this.dispatchEvent(new CustomEvent("onLoadError",{bubbles:!0,composed:!0}))}};d.styles=[a.ET,c],l([(0,n.Cb)()],d.prototype,"src",void 0),l([(0,n.Cb)()],d.prototype,"logo",void 0),l([(0,n.Cb)()],d.prototype,"icon",void 0),l([(0,n.Cb)()],d.prototype,"iconColor",void 0),l([(0,n.Cb)()],d.prototype,"alt",void 0),l([(0,n.Cb)()],d.prototype,"size",void 0),l([(0,n.Cb)({type:Boolean})],d.prototype,"boxed",void 0),l([(0,n.Cb)({type:Boolean})],d.prototype,"rounded",void 0),l([(0,n.Cb)({type:Boolean})],d.prototype,"fullSize",void 0),l([(0,s.M)("wui-image")],d)},42672:function(t,e,i){var o=i(19064),n=i(59662);i(21927);var r=i(24134),a=i(25729),s=i(95636),u=(0,s.iv)`
  button {
    background-color: transparent;
    padding: ${({spacing:t})=>t[1]};
  }

  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:t})=>t.core.foregroundAccent020};
  }

  button[data-variant='accent']:hover:enabled,
  button[data-variant='accent']:focus-visible {
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
  }

  button[data-variant='primary']:hover:enabled,
  button[data-variant='primary']:focus-visible,
  button[data-variant='secondary']:hover:enabled,
  button[data-variant='secondary']:focus-visible {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
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
    border-radius: ${({borderRadius:t})=>t[1]};
  }

  button[data-size='md'],
  button[data-size='lg'] {
    border-radius: ${({borderRadius:t})=>t[2]};
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
`,c=function(t,e,i,o){var n,r=arguments.length,a=r<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,i,o);else for(var s=t.length-1;s>=0;s--)(n=t[s])&&(a=(r<3?n(a):r>3?n(e,i,a):n(e,i))||a);return r>3&&a&&Object.defineProperty(e,i,a),a};let l=class extends o.oi{constructor(){super(...arguments),this.size="md",this.disabled=!1,this.icon="copy",this.iconColor="default",this.variant="accent"}render(){return(0,o.dy)`
      <button data-variant=${this.variant} ?disabled=${this.disabled} data-size=${this.size}>
        <wui-icon
          color=${({accent:"accent-primary",primary:"inverse",secondary:"default"})[this.variant]||this.iconColor}
          size=${this.size}
          name=${this.icon}
        ></wui-icon>
      </button>
    `}};l.styles=[r.ET,r.ZM,u],c([(0,n.Cb)()],l.prototype,"size",void 0),c([(0,n.Cb)({type:Boolean})],l.prototype,"disabled",void 0),c([(0,n.Cb)()],l.prototype,"icon",void 0),c([(0,n.Cb)()],l.prototype,"iconColor",void 0),c([(0,n.Cb)()],l.prototype,"variant",void 0),c([(0,a.M)("wui-icon-link")],l)}}]);