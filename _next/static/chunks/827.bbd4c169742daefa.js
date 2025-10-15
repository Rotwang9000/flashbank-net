"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[827],{30827:function(e,t,r){r.r(t),r.d(t,{W3mPayLoadingView:function(){return K},W3mPayView:function(){return V},arbitrumUSDC:function(){return es},arbitrumUSDT:function(){return eh},baseETH:function(){return er},baseSepoliaETH:function(){return eo},baseUSDC:function(){return ea},ethereumUSDC:function(){return en},ethereumUSDT:function(){return ed},getExchanges:function(){return X},getIsPaymentInProgress:function(){return ee},getPayError:function(){return Q},getPayResult:function(){return J},openPay:function(){return Z},optimismUSDC:function(){return ei},optimismUSDT:function(){return eu},pay:function(){return q},polygonUSDC:function(){return ec},polygonUSDT:function(){return ep},solanaSOL:function(){return em},solanaUSDC:function(){return el},solanaUSDT:function(){return eg}});var a=r(19064),o=r(59662),n=r(35162),i=r(83966),s=r(59757),c=r(83662),l=r(83241),d=r(82879),u=r(29460),h=r(28740);r(37826),r(82100),r(85642),r(54530),r(8035),r(87809),r(84350),r(73049),r(48808),r(69393),r(68390),r(73783);var p=r(86949),g=r(73932),m=r(68314),y=r(50738),b=r(51440),w=r(4104),f=r(4511);let v={INVALID_PAYMENT_CONFIG:"INVALID_PAYMENT_CONFIG",INVALID_RECIPIENT:"INVALID_RECIPIENT",INVALID_ASSET:"INVALID_ASSET",INVALID_AMOUNT:"INVALID_AMOUNT",UNKNOWN_ERROR:"UNKNOWN_ERROR",UNABLE_TO_INITIATE_PAYMENT:"UNABLE_TO_INITIATE_PAYMENT",INVALID_CHAIN_NAMESPACE:"INVALID_CHAIN_NAMESPACE",GENERIC_PAYMENT_ERROR:"GENERIC_PAYMENT_ERROR",UNABLE_TO_GET_EXCHANGES:"UNABLE_TO_GET_EXCHANGES",ASSET_NOT_SUPPORTED:"ASSET_NOT_SUPPORTED",UNABLE_TO_GET_PAY_URL:"UNABLE_TO_GET_PAY_URL",UNABLE_TO_GET_BUY_STATUS:"UNABLE_TO_GET_BUY_STATUS"},x={[v.INVALID_PAYMENT_CONFIG]:"Invalid payment configuration",[v.INVALID_RECIPIENT]:"Invalid recipient address",[v.INVALID_ASSET]:"Invalid asset specified",[v.INVALID_AMOUNT]:"Invalid payment amount",[v.UNKNOWN_ERROR]:"Unknown payment error occurred",[v.UNABLE_TO_INITIATE_PAYMENT]:"Unable to initiate payment",[v.INVALID_CHAIN_NAMESPACE]:"Invalid chain namespace",[v.GENERIC_PAYMENT_ERROR]:"Unable to process payment",[v.UNABLE_TO_GET_EXCHANGES]:"Unable to get exchanges",[v.ASSET_NOT_SUPPORTED]:"Asset not supported by the selected exchange",[v.UNABLE_TO_GET_PAY_URL]:"Unable to get payment URL",[v.UNABLE_TO_GET_BUY_STATUS]:"Unable to get buy status"};class C extends Error{get message(){return x[this.code]}constructor(e,t){super(x[e]),this.name="AppKitPayError",this.code=e,this.details=t,Error.captureStackTrace&&Error.captureStackTrace(this,C)}}var E=r(77500);class I extends Error{}async function P(e,t){let r=function(){let e=E.OptionsController.getSnapshot().projectId;return`https://rpc.walletconnect.org/v1/json-rpc?projectId=${e}`}(),{sdkType:a,sdkVersion:o,projectId:n}=E.OptionsController.getSnapshot(),i={jsonrpc:"2.0",id:1,method:e,params:{...t||{},st:a,sv:o,projectId:n}},s=await fetch(r,{method:"POST",body:JSON.stringify(i),headers:{"Content-Type":"application/json"}}),c=await s.json();if(c.error)throw new I(c.error.message);return c}async function A(e){return(await P("reown_getExchanges",e)).result}async function N(e){return(await P("reown_getExchangePayUrl",e)).result}async function k(e){return(await P("reown_getExchangeBuyStatus",e)).result}let S=["eip155","solana"],$={eip155:{native:{assetNamespace:"slip44",assetReference:"60"},defaultTokenNamespace:"erc20"},solana:{native:{assetNamespace:"slip44",assetReference:"501"},defaultTokenNamespace:"token"}};function T(e,t){let{chainNamespace:r,chainId:a}=y.u.parseCaipNetworkId(e),o=$[r];if(!o)throw Error(`Unsupported chain namespace for CAIP-19 formatting: ${r}`);let n=o.native.assetNamespace,i=o.native.assetReference;"native"!==t&&(n=o.defaultTokenNamespace,i=t);let s=`${r}:${a}`;return`${s}/${n}:${i}`}var _=r(30508);async function R(e){let{paymentAssetNetwork:t,activeCaipNetwork:r,approvedCaipNetworkIds:a,requestedCaipNetworks:o}=e,n=l.j.sortRequestedNetworks(a,o).find(e=>e.caipNetworkId===t);if(!n)throw new C(v.INVALID_PAYMENT_CONFIG);if(n.caipNetworkId===r.caipNetworkId)return;let i=s.R.getNetworkProp("supportsAllNetworks",n.chainNamespace);if(!(a?.includes(n.caipNetworkId)||i))throw new C(v.INVALID_PAYMENT_CONFIG);try{await s.R.switchActiveNetwork(n)}catch(e){throw new C(v.GENERIC_PAYMENT_ERROR,e)}}async function z(e,t,r){if(t!==m.b.CHAIN.EVM)throw new C(v.INVALID_CHAIN_NAMESPACE);if(!r.fromAddress)throw new C(v.INVALID_PAYMENT_CONFIG,"fromAddress is required for native EVM payments.");let a="string"==typeof r.amount?parseFloat(r.amount):r.amount;if(isNaN(a))throw new C(v.INVALID_PAYMENT_CONFIG);let o=e.metadata?.decimals??18,n=u.ConnectionController.parseUnits(a.toString(),o);if("bigint"!=typeof n)throw new C(v.GENERIC_PAYMENT_ERROR);return await u.ConnectionController.sendTransaction({chainNamespace:t,to:r.recipient,address:r.fromAddress,value:n,data:"0x"})??void 0}async function O(e,t){if(!t.fromAddress)throw new C(v.INVALID_PAYMENT_CONFIG,"fromAddress is required for ERC20 EVM payments.");let r=e.asset,a=t.recipient,o=Number(e.metadata.decimals),n=u.ConnectionController.parseUnits(t.amount.toString(),o);if(void 0===n)throw new C(v.GENERIC_PAYMENT_ERROR);return await u.ConnectionController.writeContract({fromAddress:t.fromAddress,tokenAddress:r,args:[a,n],method:"transfer",abi:_.g.getERC20Abi(r),chainNamespace:m.b.CHAIN.EVM})??void 0}async function D(e,t){if(e!==m.b.CHAIN.SOLANA)throw new C(v.INVALID_CHAIN_NAMESPACE);if(!t.fromAddress)throw new C(v.INVALID_PAYMENT_CONFIG,"fromAddress is required for Solana payments.");let r="string"==typeof t.amount?parseFloat(t.amount):t.amount;if(isNaN(r)||r<=0)throw new C(v.INVALID_PAYMENT_CONFIG,"Invalid payment amount.");try{if(!w.O.getProvider(e))throw new C(v.GENERIC_PAYMENT_ERROR,"No Solana provider available.");let a=await u.ConnectionController.sendTransaction({chainNamespace:m.b.CHAIN.SOLANA,to:t.recipient,value:r,tokenMint:t.tokenMint});if(!a)throw new C(v.GENERIC_PAYMENT_ERROR,"Transaction failed.");return a}catch(e){if(e instanceof C)throw e;throw new C(v.GENERIC_PAYMENT_ERROR,`Solana payment failed: ${e}`)}}let U="unknown",L=(0,p.sj)({paymentAsset:{network:"eip155:1",asset:"0x0",metadata:{name:"0x0",symbol:"0x0",decimals:0}},recipient:"0x0",amount:0,isConfigured:!1,error:null,isPaymentInProgress:!1,exchanges:[],isLoading:!1,openInNewTab:!0,redirectUrl:void 0,payWithExchange:void 0,currentPayment:void 0,analyticsSet:!1,paymentId:void 0}),M={state:L,subscribe:e=>(0,p.Ld)(L,()=>e(L)),subscribeKey:(e,t)=>(0,g.VW)(L,e,t),async handleOpenPay(e){this.resetState(),this.setPaymentConfig(e),this.subscribeEvents(),this.initializeAnalytics(),L.isConfigured=!0,b.X.sendEvent({type:"track",event:"PAY_MODAL_OPEN",properties:{exchanges:L.exchanges,configuration:{network:L.paymentAsset.network,asset:L.paymentAsset.asset,recipient:L.recipient,amount:L.amount}}}),await c.I.open({view:"Pay"})},resetState(){L.paymentAsset={network:"eip155:1",asset:"0x0",metadata:{name:"0x0",symbol:"0x0",decimals:0}},L.recipient="0x0",L.amount=0,L.isConfigured=!1,L.error=null,L.isPaymentInProgress=!1,L.isLoading=!1,L.currentPayment=void 0},setPaymentConfig(e){if(!e.paymentAsset)throw new C(v.INVALID_PAYMENT_CONFIG);try{L.paymentAsset=e.paymentAsset,L.recipient=e.recipient,L.amount=e.amount,L.openInNewTab=e.openInNewTab??!0,L.redirectUrl=e.redirectUrl,L.payWithExchange=e.payWithExchange,L.error=null}catch(e){throw new C(v.INVALID_PAYMENT_CONFIG,e.message)}},getPaymentAsset:()=>L.paymentAsset,getExchanges:()=>L.exchanges,async fetchExchanges(){try{L.isLoading=!0;let e=await A({page:0,asset:T(L.paymentAsset.network,L.paymentAsset.asset),amount:L.amount.toString()});L.exchanges=e.exchanges.slice(0,2)}catch(e){throw d.SnackController.showError(x.UNABLE_TO_GET_EXCHANGES),new C(v.UNABLE_TO_GET_EXCHANGES)}finally{L.isLoading=!1}},async getAvailableExchanges(e){try{let t=e?.asset&&e?.network?T(e.network,e.asset):void 0;return await A({page:e?.page??0,asset:t,amount:e?.amount?.toString()})}catch(e){throw new C(v.UNABLE_TO_GET_EXCHANGES)}},async getPayUrl(e,t,r=!1){try{let a=Number(t.amount),o=await N({exchangeId:e,asset:T(t.network,t.asset),amount:a.toString(),recipient:`${t.network}:${t.recipient}`});return b.X.sendEvent({type:"track",event:"PAY_EXCHANGE_SELECTED",properties:{source:"pay",exchange:{id:e},configuration:{network:t.network,asset:t.asset,recipient:t.recipient,amount:a},currentPayment:{type:"exchange",exchangeId:e},headless:r}}),r&&(this.initiatePayment(),b.X.sendEvent({type:"track",event:"PAY_INITIATED",properties:{source:"pay",paymentId:L.paymentId||U,configuration:{network:t.network,asset:t.asset,recipient:t.recipient,amount:a},currentPayment:{type:"exchange",exchangeId:e}}})),o}catch(e){if(e instanceof Error&&e.message.includes("is not supported"))throw new C(v.ASSET_NOT_SUPPORTED);throw Error(e.message)}},async openPayUrl(e,t,r=!1){try{let a=await this.getPayUrl(e.exchangeId,t,r);if(!a)throw new C(v.UNABLE_TO_GET_PAY_URL);let o=e.openInNewTab??!0;return l.j.openHref(a.url,o?"_blank":"_self"),a}catch(e){throw e instanceof C?L.error=e.message:L.error=x.GENERIC_PAYMENT_ERROR,new C(v.UNABLE_TO_GET_PAY_URL)}},subscribeEvents(){L.isConfigured||(u.ConnectionController.subscribeKey("connections",e=>{e.size>0&&this.handlePayment()}),i.AccountController.subscribeKey("caipAddress",e=>{let t=u.ConnectionController.hasAnyConnection(m.b.CONNECTOR_ID.WALLET_CONNECT);e&&(t?setTimeout(()=>{this.handlePayment()},100):this.handlePayment())}))},async handlePayment(){L.currentPayment={type:"wallet",status:"IN_PROGRESS"};let e=i.AccountController.state.caipAddress;if(!e)return;let{chainId:t,address:r}=y.u.parseCaipAddress(e),a=s.R.state.activeChain;if(!r||!t||!a||!w.O.getProvider(a))return;let o=s.R.state.activeCaipNetwork;if(o&&!L.isPaymentInProgress)try{this.initiatePayment();let e=s.R.getAllRequestedCaipNetworks(),t=s.R.getAllApprovedCaipNetworkIds();switch(await R({paymentAssetNetwork:L.paymentAsset.network,activeCaipNetwork:o,approvedCaipNetworkIds:t,requestedCaipNetworks:e}),await c.I.open({view:"PayLoading"}),a){case m.b.CHAIN.EVM:"native"===L.paymentAsset.asset&&(L.currentPayment.result=await z(L.paymentAsset,a,{recipient:L.recipient,amount:L.amount,fromAddress:r})),L.paymentAsset.asset.startsWith("0x")&&(L.currentPayment.result=await O(L.paymentAsset,{recipient:L.recipient,amount:L.amount,fromAddress:r})),L.currentPayment.status="SUCCESS";break;case m.b.CHAIN.SOLANA:L.currentPayment.result=await D(a,{recipient:L.recipient,amount:L.amount,fromAddress:r,tokenMint:"native"===L.paymentAsset.asset?void 0:L.paymentAsset.asset}),L.currentPayment.status="SUCCESS";break;default:throw new C(v.INVALID_CHAIN_NAMESPACE)}}catch(e){e instanceof C?L.error=e.message:L.error=x.GENERIC_PAYMENT_ERROR,L.currentPayment.status="FAILED",d.SnackController.showError(L.error)}finally{L.isPaymentInProgress=!1}},getExchangeById:e=>L.exchanges.find(t=>t.id===e),validatePayConfig(e){let{paymentAsset:t,recipient:r,amount:a}=e;if(!t)throw new C(v.INVALID_PAYMENT_CONFIG);if(!r)throw new C(v.INVALID_RECIPIENT);if(!t.asset)throw new C(v.INVALID_ASSET);if(null==a||a<=0)throw new C(v.INVALID_AMOUNT)},handlePayWithWallet(){let e=i.AccountController.state.caipAddress;if(!e){f.RouterController.push("Connect");return}let{chainId:t,address:r}=y.u.parseCaipAddress(e),a=s.R.state.activeChain;if(!r||!t||!a){f.RouterController.push("Connect");return}this.handlePayment()},async handlePayWithExchange(e){try{L.currentPayment={type:"exchange",exchangeId:e};let{network:t,asset:r}=L.paymentAsset,a={network:t,asset:r,amount:L.amount,recipient:L.recipient},o=await this.getPayUrl(e,a);if(!o)throw new C(v.UNABLE_TO_INITIATE_PAYMENT);return L.currentPayment.sessionId=o.sessionId,L.currentPayment.status="IN_PROGRESS",L.currentPayment.exchangeId=e,this.initiatePayment(),{url:o.url,openInNewTab:L.openInNewTab}}catch(e){return e instanceof C?L.error=e.message:L.error=x.GENERIC_PAYMENT_ERROR,L.isPaymentInProgress=!1,d.SnackController.showError(L.error),null}},async getBuyStatus(e,t){try{let r=await k({sessionId:t,exchangeId:e});return("SUCCESS"===r.status||"FAILED"===r.status)&&b.X.sendEvent({type:"track",event:"SUCCESS"===r.status?"PAY_SUCCESS":"PAY_ERROR",properties:{message:"FAILED"===r.status?l.j.parseError(L.error):void 0,source:"pay",paymentId:L.paymentId||U,configuration:{network:L.paymentAsset.network,asset:L.paymentAsset.asset,recipient:L.recipient,amount:L.amount},currentPayment:{type:"exchange",exchangeId:L.currentPayment?.exchangeId,sessionId:L.currentPayment?.sessionId,result:r.txHash}}}),r}catch(e){throw new C(v.UNABLE_TO_GET_BUY_STATUS)}},async updateBuyStatus(e,t){try{let r=await this.getBuyStatus(e,t);L.currentPayment&&(L.currentPayment.status=r.status,L.currentPayment.result=r.txHash),("SUCCESS"===r.status||"FAILED"===r.status)&&(L.isPaymentInProgress=!1)}catch(e){throw new C(v.UNABLE_TO_GET_BUY_STATUS)}},initiatePayment(){L.isPaymentInProgress=!0,L.paymentId=crypto.randomUUID()},initializeAnalytics(){L.analyticsSet||(L.analyticsSet=!0,this.subscribeKey("isPaymentInProgress",e=>{if(L.currentPayment?.status&&"UNKNOWN"!==L.currentPayment.status){let e={IN_PROGRESS:"PAY_INITIATED",SUCCESS:"PAY_SUCCESS",FAILED:"PAY_ERROR"}[L.currentPayment.status];b.X.sendEvent({type:"track",event:e,properties:{message:"FAILED"===L.currentPayment.status?l.j.parseError(L.error):void 0,source:"pay",paymentId:L.paymentId||U,configuration:{network:L.paymentAsset.network,asset:L.paymentAsset.asset,recipient:L.recipient,amount:L.amount},currentPayment:{type:L.currentPayment.type,exchangeId:L.currentPayment.exchangeId,sessionId:L.currentPayment.sessionId,result:L.currentPayment.result}}})}}))}};var B=(0,a.iv)`
  wui-separator {
    margin: var(--apkt-spacing-3) calc(var(--apkt-spacing-3) * -1) var(--apkt-spacing-2)
      calc(var(--apkt-spacing-3) * -1);
    width: calc(100% + var(--apkt-spacing-3) * 2);
  }

  .token-display {
    padding: var(--apkt-spacing-3) var(--apkt-spacing-3);
    border-radius: var(--apkt-borderRadius-5);
    background-color: var(--apkt-tokens-theme-backgroundPrimary);
    margin-top: var(--apkt-spacing-3);
    margin-bottom: var(--apkt-spacing-3);
  }

  .token-display wui-text {
    text-transform: none;
  }

  wui-loading-spinner {
    padding: var(--apkt-spacing-2);
  }
`,j=function(e,t,r,a){var o,n=arguments.length,i=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,r):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,a);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(i=(n<3?o(i):n>3?o(t,r,i):o(t,r))||i);return n>3&&i&&Object.defineProperty(t,r,i),i};let V=class extends a.oi{constructor(){super(),this.unsubscribe=[],this.amount="",this.tokenSymbol="",this.networkName="",this.exchanges=M.state.exchanges,this.isLoading=M.state.isLoading,this.loadingExchangeId=null,this.connectedWalletInfo=i.AccountController.state.connectedWalletInfo,this.initializePaymentDetails(),this.unsubscribe.push(M.subscribeKey("exchanges",e=>this.exchanges=e)),this.unsubscribe.push(M.subscribeKey("isLoading",e=>this.isLoading=e)),this.unsubscribe.push(i.AccountController.subscribe(e=>this.connectedWalletInfo=e.connectedWalletInfo)),M.fetchExchanges()}get isWalletConnected(){return"connected"===i.AccountController.state.status}render(){return(0,a.dy)`
      <wui-flex flexDirection="column">
        <wui-flex flexDirection="column" .padding=${["0","4","4","4"]} gap="3">
          ${this.renderPaymentHeader()}

          <wui-flex flexDirection="column" gap="3">
            ${this.renderPayWithWallet()} ${this.renderExchangeOptions()}
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}initializePaymentDetails(){let e=M.getPaymentAsset();this.networkName=e.network,this.tokenSymbol=e.metadata.symbol,this.amount=M.state.amount.toString()}renderPayWithWallet(){return!function(e){let{chainNamespace:t}=y.u.parseCaipNetworkId(e);return S.includes(t)}(this.networkName)?(0,a.dy)``:(0,a.dy)`<wui-flex flexDirection="column" gap="3">
        ${this.isWalletConnected?this.renderConnectedView():this.renderDisconnectedView()}
      </wui-flex>
      <wui-separator text="or"></wui-separator>`}renderPaymentHeader(){let e=this.networkName;if(this.networkName){let t=s.R.getAllRequestedCaipNetworks().find(e=>e.caipNetworkId===this.networkName);t&&(e=t.name)}return(0,a.dy)`
      <wui-flex flexDirection="column" alignItems="center">
        <wui-flex alignItems="center" gap="2">
          <wui-text variant="h1-regular" color="primary">${this.amount||"0.0000"}</wui-text>
          <wui-flex class="token-display" alignItems="center" gap="1">
            <wui-text variant="md-medium" color="primary">
              ${this.tokenSymbol||"Unknown Asset"}
            </wui-text>
            ${e?(0,a.dy)`
                  <wui-text variant="sm-medium" color="secondary">
                    on ${e}
                  </wui-text>
                `:""}
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `}renderConnectedView(){let e=this.connectedWalletInfo?.name||"connected wallet";return(0,a.dy)`
      <wui-list-item
        @click=${this.onWalletPayment}
        ?chevron=${!0}
        ?fullSize=${!0}
        ?rounded=${!0}
        data-testid="wallet-payment-option"
        imageSrc=${(0,n.o)(this.connectedWalletInfo?.icon)}
      >
        <wui-text variant="lg-regular" color="primary">Pay with ${e}</wui-text>
      </wui-list-item>

      <wui-list-item
        icon="power"
        ?rounded=${!0}
        iconColor="error"
        @click=${this.onDisconnect}
        data-testid="disconnect-button"
        ?chevron=${!1}
      >
        <wui-text variant="lg-regular" color="secondary">Disconnect</wui-text>
      </wui-list-item>
    `}renderDisconnectedView(){return(0,a.dy)`<wui-list-item
      variant="icon"
      iconVariant="overlay"
      icon="wallet"
      ?rounded=${!0}
      @click=${this.onWalletPayment}
      ?chevron=${!0}
      data-testid="wallet-payment-option"
    >
      <wui-text variant="lg-regular" color="primary">Pay from wallet</wui-text>
    </wui-list-item>`}renderExchangeOptions(){return this.isLoading?(0,a.dy)`<wui-flex justifyContent="center" alignItems="center">
        <wui-spinner size="md"></wui-spinner>
      </wui-flex>`:0===this.exchanges.length?(0,a.dy)`<wui-flex justifyContent="center" alignItems="center">
        <wui-text variant="md-medium" color="primary">No exchanges available</wui-text>
      </wui-flex>`:this.exchanges.map(e=>(0,a.dy)`
        <wui-list-item
          @click=${()=>this.onExchangePayment(e.id)}
          data-testid="exchange-option-${e.id}"
          ?chevron=${!0}
          ?disabled=${null!==this.loadingExchangeId}
          ?loading=${this.loadingExchangeId===e.id}
          imageSrc=${(0,n.o)(e.imageUrl)}
        >
          <wui-flex alignItems="center" gap="3">
            <wui-text flexGrow="1" variant="md-medium" color="primary"
              >Pay with ${e.name} <wui-spinner size="sm" color="secondary"></wui-spinner
            ></wui-text>
          </wui-flex>
        </wui-list-item>
      `)}onWalletPayment(){M.handlePayWithWallet()}async onExchangePayment(e){try{this.loadingExchangeId=e;let t=await M.handlePayWithExchange(e);t&&(await c.I.open({view:"PayLoading"}),l.j.openHref(t.url,t.openInNewTab?"_blank":"_self"))}catch(e){console.error("Failed to pay with exchange",e),d.SnackController.showError("Failed to pay with exchange")}finally{this.loadingExchangeId=null}}async onDisconnect(e){e.stopPropagation();try{await u.ConnectionController.disconnect()}catch{console.error("Failed to disconnect"),d.SnackController.showError("Failed to disconnect")}}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}};V.styles=B,j([(0,o.SB)()],V.prototype,"amount",void 0),j([(0,o.SB)()],V.prototype,"tokenSymbol",void 0),j([(0,o.SB)()],V.prototype,"networkName",void 0),j([(0,o.SB)()],V.prototype,"exchanges",void 0),j([(0,o.SB)()],V.prototype,"isLoading",void 0),j([(0,o.SB)()],V.prototype,"loadingExchangeId",void 0),j([(0,o.SB)()],V.prototype,"connectedWalletInfo",void 0),V=j([(0,h.Mo)("w3m-pay-view")],V);var Y=r(12858),G=r(9793),W=r(44639);r(7013);var F=(0,a.iv)`
  :host {
    display: block;
    height: 100%;
    width: 100%;
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-thumbnail {
    position: absolute;
  }
`,H=function(e,t,r,a){var o,n=arguments.length,i=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,r):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,a);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(i=(n<3?o(i):n>3?o(t,r,i):o(t,r))||i);return n>3&&i&&Object.defineProperty(t,r,i),i};let K=class extends a.oi{constructor(){super(),this.loadingMessage="",this.subMessage="",this.paymentState="in-progress",this.paymentState=M.state.isPaymentInProgress?"in-progress":"completed",this.updateMessages(),this.setupSubscription(),this.setupExchangeSubscription()}disconnectedCallback(){clearInterval(this.exchangeSubscription)}render(){return(0,a.dy)`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["7","5","5","5"]}
        gap="9"
      >
        <wui-flex justifyContent="center" alignItems="center"> ${this.getStateIcon()} </wui-flex>
        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="lg-medium" color="primary">
            ${this.loadingMessage}
          </wui-text>
          <wui-text align="center" variant="lg-regular" color="secondary">
            ${this.subMessage}
          </wui-text>
        </wui-flex>
      </wui-flex>
    `}updateMessages(){switch(this.paymentState){case"completed":this.loadingMessage="Payment completed",this.subMessage="Your transaction has been successfully processed";break;case"error":this.loadingMessage="Payment failed",this.subMessage="There was an error processing your transaction";break;default:M.state.currentPayment?.type==="exchange"?(this.loadingMessage="Payment initiated",this.subMessage="Please complete the payment on the exchange"):(this.loadingMessage="Awaiting payment confirmation",this.subMessage="Please confirm the payment transaction in your wallet")}}getStateIcon(){switch(this.paymentState){case"completed":return this.successTemplate();case"error":return this.errorTemplate();default:return this.loaderTemplate()}}setupExchangeSubscription(){M.state.currentPayment?.type==="exchange"&&(this.exchangeSubscription=setInterval(async()=>{let e=M.state.currentPayment?.exchangeId,t=M.state.currentPayment?.sessionId;e&&t&&(await M.updateBuyStatus(e,t),M.state.currentPayment?.status==="SUCCESS"&&clearInterval(this.exchangeSubscription))},4e3))}setupSubscription(){M.subscribeKey("isPaymentInProgress",e=>{e||"in-progress"!==this.paymentState||(M.state.error||!M.state.currentPayment?.result?this.paymentState="error":this.paymentState="completed",this.updateMessages(),setTimeout(()=>{"disconnected"!==u.ConnectionController.state.status&&c.I.close()},3e3))}),M.subscribeKey("error",e=>{e&&"in-progress"===this.paymentState&&(this.paymentState="error",this.updateMessages())})}loaderTemplate(){let e=Y.ThemeController.state.themeVariables["--w3m-border-radius-master"],t=e?parseInt(e.replace("px",""),10):4,r=this.getPaymentIcon();return(0,a.dy)`
      <wui-flex justifyContent="center" alignItems="center" style="position: relative;">
        ${r?(0,a.dy)`<wui-wallet-image size="lg" imageSrc=${r}></wui-wallet-image>`:null}
        <wui-loading-thumbnail radius=${9*t}></wui-loading-thumbnail>
      </wui-flex>
    `}getPaymentIcon(){let e=M.state.currentPayment;if(e){if("exchange"===e.type){let t=e.exchangeId;if(t){let e=M.getExchangeById(t);return e?.imageUrl}}if("wallet"===e.type){let e=i.AccountController.state.connectedWalletInfo?.icon;if(e)return e;let t=s.R.state.activeChain;if(!t)return;let r=G.ConnectorController.getConnectorId(t);if(!r)return;let a=G.ConnectorController.getConnectorById(r);if(!a)return;return W.f.getConnectorImage(a)}}}successTemplate(){return(0,a.dy)`<wui-icon size="xl" color="success" name="checkmark"></wui-icon>`}errorTemplate(){return(0,a.dy)`<wui-icon size="xl" color="error" name="close"></wui-icon>`}};async function Z(e){return M.handleOpenPay(e)}async function q(e,t=3e5){if(t<=0)throw new C(v.INVALID_PAYMENT_CONFIG,"Timeout must be greater than 0");try{await Z(e)}catch(e){if(e instanceof C)throw e;throw new C(v.UNABLE_TO_INITIATE_PAYMENT,e.message)}return new Promise((e,r)=>{var a;let o=!1,n=setTimeout(()=>{o||(o=!0,s(),r(new C(v.GENERIC_PAYMENT_ERROR,"Payment timeout")))},t);function i(){if(o)return;let t=M.state.currentPayment,r=M.state.error,a=M.state.isPaymentInProgress;if(t?.status==="SUCCESS"){o=!0,s(),clearTimeout(n),e({success:!0,result:t.result});return}if(t?.status==="FAILED"){o=!0,s(),clearTimeout(n),e({success:!1,error:r||"Payment failed"});return}!r||a||t||(o=!0,s(),clearTimeout(n),e({success:!1,error:r}))}let s=(a=[et("currentPayment",i),et("error",i),et("isPaymentInProgress",i)],()=>{a.forEach(e=>{try{e()}catch{}})});i()})}function X(){return M.getExchanges()}function J(){return M.state.currentPayment?.result}function Q(){return M.state.error}function ee(){return M.state.isPaymentInProgress}function et(e,t){return M.subscribeKey(e,t)}K.styles=F,H([(0,o.SB)()],K.prototype,"loadingMessage",void 0),H([(0,o.SB)()],K.prototype,"subMessage",void 0),H([(0,o.SB)()],K.prototype,"paymentState",void 0),K=H([(0,h.Mo)("w3m-pay-loading-view")],K);let er={network:"eip155:8453",asset:"native",metadata:{name:"Ethereum",symbol:"ETH",decimals:18}},ea={network:"eip155:8453",asset:"0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},eo={network:"eip155:84532",asset:"native",metadata:{name:"Ethereum",symbol:"ETH",decimals:18}},en={network:"eip155:1",asset:"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},ei={network:"eip155:10",asset:"0x0b2c639c533813f4aa9d7837caf62653d097ff85",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},es={network:"eip155:42161",asset:"0xaf88d065e77c8cC2239327C5EDb3A432268e5831",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},ec={network:"eip155:137",asset:"0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},el={network:"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",asset:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",metadata:{name:"USD Coin",symbol:"USDC",decimals:6}},ed={network:"eip155:1",asset:"0xdAC17F958D2ee523a2206206994597C13D831ec7",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},eu={network:"eip155:10",asset:"0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},eh={network:"eip155:42161",asset:"0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},ep={network:"eip155:137",asset:"0xc2132d05d31c914a87c6611c10748aeb04b58e8f",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},eg={network:"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",asset:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",metadata:{name:"Tether USD",symbol:"USDT",decimals:6}},em={network:"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",asset:"native",metadata:{name:"Solana",symbol:"SOL",decimals:9}}},37826:function(e,t,r){r(14768)},54530:function(e,t,r){var a=r(19064),o=r(59662);r(21927);var n=r(24134),i=r(25729),s=r(95636),c=(0,s.iv)`
  :host {
    position: relative;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    padding: ${({spacing:e})=>e[1]};
  }

  /* -- Colors --------------------------------------------------- */
  button[data-type='accent'] wui-icon {
    color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  button[data-type='neutral'][data-variant='primary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconInverse};
  }

  button[data-type='neutral'][data-variant='secondary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  button[data-type='success'] wui-icon {
    color: ${({tokens:e})=>e.core.iconSuccess};
  }

  button[data-type='error'] wui-icon {
    color: ${({tokens:e})=>e.core.iconError};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='xs'] {
    width: 16px;
    height: 16px;

    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='sm'] {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='md'] {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='lg'] {
    width: 28px;
    height: 28px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='xs'] wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] wui-icon {
    width: 20px;
    height: 20px;
  }

  /* -- Hover --------------------------------------------------- */
  @media (hover: hover) {
    button[data-type='accent']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    }

    button[data-variant='primary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-variant='secondary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-type='success']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundSuccess};
    }

    button[data-type='error']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundError};
    }
  }

  /* -- Focus --------------------------------------------------- */
  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent020};
  }

  /* -- Properties --------------------------------------------------- */
  button[data-full-width='true'] {
    width: 100%;
  }

  :host([fullWidth]) {
    width: 100%;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`,l=function(e,t,r,a){var o,n=arguments.length,i=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,r):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,a);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(i=(n<3?o(i):n>3?o(t,r,i):o(t,r))||i);return n>3&&i&&Object.defineProperty(t,r,i),i};let d=class extends a.oi{constructor(){super(...arguments),this.icon="card",this.variant="primary",this.type="accent",this.size="md",this.fullWidth=!1,this.disabled=!1}render(){return(0,a.dy)`<button
      data-variant=${this.variant}
      data-type=${this.type}
      data-size=${this.size}
      data-full-width=${this.fullWidth}
      ?disabled=${this.disabled}
    >
      <wui-icon color="inherit" name=${this.icon}></wui-icon>
    </button>`}};d.styles=[n.ET,n.ZM,c],l([(0,o.Cb)()],d.prototype,"icon",void 0),l([(0,o.Cb)()],d.prototype,"variant",void 0),l([(0,o.Cb)()],d.prototype,"type",void 0),l([(0,o.Cb)()],d.prototype,"size",void 0),l([(0,o.Cb)({type:Boolean})],d.prototype,"fullWidth",void 0),l([(0,o.Cb)({type:Boolean})],d.prototype,"disabled",void 0),l([(0,i.M)("wui-icon-button")],d)},8035:function(e,t,r){r(42672)},85642:function(e,t,r){r(21927)},87809:function(e,t,r){r(31059)},84350:function(e,t,r){var a=r(19064),o=r(59662),n=r(35162);r(51243),r(79556);var i=r(24134),s=r(25729),c=r(95636),l=(0,c.iv)`
  :host {
    width: 100%;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({spacing:e})=>e[3]};
    width: 100%;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border-radius: ${({borderRadius:e})=>e[4]};
    transition:
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      scale ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color, scale;
  }

  wui-text {
    text-transform: capitalize;
  }

  wui-image {
    color: ${({tokens:e})=>e.theme.textPrimary};
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
`,d=function(e,t,r,a){var o,n=arguments.length,i=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,r):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,a);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(i=(n<3?o(i):n>3?o(t,r,i):o(t,r))||i);return n>3&&i&&Object.defineProperty(t,r,i),i};let u=class extends a.oi{constructor(){super(...arguments),this.imageSrc="google",this.loading=!1,this.disabled=!1,this.rightIcon=!0,this.rounded=!1,this.fullSize=!1}render(){return this.dataset.rounded=this.rounded?"true":"false",(0,a.dy)`
      <button
        ?disabled=${!!this.loading||!!this.disabled}
        data-loading=${this.loading}
        tabindex=${(0,n.o)(this.tabIdx)}
      >
        <wui-flex gap="2" alignItems="center">
          ${this.templateLeftIcon()}
          <wui-flex gap="1">
            <slot></slot>
          </wui-flex>
        </wui-flex>
        ${this.templateRightIcon()}
      </button>
    `}templateLeftIcon(){return this.icon?(0,a.dy)`<wui-image
        icon=${this.icon}
        iconColor=${(0,n.o)(this.iconColor)}
        ?boxed=${!0}
        ?rounded=${this.rounded}
      ></wui-image>`:(0,a.dy)`<wui-image
      ?boxed=${!0}
      ?rounded=${this.rounded}
      ?fullSize=${this.fullSize}
      src=${this.imageSrc}
    ></wui-image>`}templateRightIcon(){return this.rightIcon?this.loading?(0,a.dy)`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:(0,a.dy)`<wui-icon name="chevronRight" size="lg" color="default"></wui-icon>`:null}};u.styles=[i.ET,i.ZM,l],d([(0,o.Cb)()],u.prototype,"imageSrc",void 0),d([(0,o.Cb)()],u.prototype,"icon",void 0),d([(0,o.Cb)()],u.prototype,"iconColor",void 0),d([(0,o.Cb)({type:Boolean})],u.prototype,"loading",void 0),d([(0,o.Cb)()],u.prototype,"tabIdx",void 0),d([(0,o.Cb)({type:Boolean})],u.prototype,"disabled",void 0),d([(0,o.Cb)({type:Boolean})],u.prototype,"rightIcon",void 0),d([(0,o.Cb)({type:Boolean})],u.prototype,"rounded",void 0),d([(0,o.Cb)({type:Boolean})],u.prototype,"fullSize",void 0),d([(0,s.M)("wui-list-item")],u)},73049:function(e,t,r){r(51243)},7013:function(e,t,r){var a=r(19064),o=r(59662),n=r(24134),i=r(25729),s=r(95636),c=(0,s.iv)`
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
`,l=function(e,t,r,a){var o,n=arguments.length,i=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,r):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,a);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(i=(n<3?o(i):n>3?o(t,r,i):o(t,r))||i);return n>3&&i&&Object.defineProperty(t,r,i),i};let d=class extends a.oi{constructor(){super(...arguments),this.radius=36}render(){return this.svgLoaderTemplate()}svgLoaderTemplate(){let e=this.radius>50?50:this.radius,t=36-e;return(0,a.dy)`
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
    `}};d.styles=[n.ET,c],l([(0,o.Cb)({type:Number})],d.prototype,"radius",void 0),l([(0,i.M)("wui-loading-thumbnail")],d)},48808:function(e,t,r){var a=r(19064),o=r(59662);let n=(0,a.YP)`<svg width="86" height="96" fill="none">
  <path
    d="M78.3244 18.926L50.1808 2.45078C45.7376 -0.150261 40.2624 -0.150262 35.8192 2.45078L7.6756 18.926C3.23322 21.5266 0.5 26.3301 0.5 31.5248V64.4752C0.5 69.6699 3.23322 74.4734 7.6756 77.074L35.8192 93.5492C40.2624 96.1503 45.7376 96.1503 50.1808 93.5492L78.3244 77.074C82.7668 74.4734 85.5 69.6699 85.5 64.4752V31.5248C85.5 26.3301 82.7668 21.5266 78.3244 18.926Z"
  />
</svg>`;var i=r(16965);let s=(0,a.YP)`
  <svg fill="none" viewBox="0 0 36 40">
    <path
      d="M15.4 2.1a5.21 5.21 0 0 1 5.2 0l11.61 6.7a5.21 5.21 0 0 1 2.61 4.52v13.4c0 1.87-1 3.59-2.6 4.52l-11.61 6.7c-1.62.93-3.6.93-5.22 0l-11.6-6.7a5.21 5.21 0 0 1-2.61-4.51v-13.4c0-1.87 1-3.6 2.6-4.52L15.4 2.1Z"
    />
  </svg>
`;r(21927),r(31059);var c=r(24134),l=r(25729),d=r(95636),u=(0,d.iv)`
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
`,h=function(e,t,r,a){var o,n=arguments.length,i=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,r):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,a);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(i=(n<3?o(i):n>3?o(t,r,i):o(t,r))||i);return n>3&&i&&Object.defineProperty(t,r,i),i};let p=class extends a.oi{constructor(){super(...arguments),this.size="md",this.name="uknown",this.networkImagesBySize={sm:s,md:i.W,lg:n},this.selected=!1,this.round=!1}render(){return this.round?(this.dataset.round="true",this.style.cssText=`
      --local-width: var(--apkt-spacing-10);
      --local-height: var(--apkt-spacing-10);
      --local-icon-size: var(--apkt-spacing-4);
    `):this.style.cssText=`

      --local-path: var(--apkt-path-network-${this.size});
      --local-width:  var(--apkt-width-network-${this.size});
      --local-height:  var(--apkt-height-network-${this.size});
      --local-icon-size:  var(--apkt-spacing-${({sm:"4",md:"6",lg:"10"})[this.size]});
    `,(0,a.dy)`${this.templateVisual()} ${this.svgTemplate()} `}svgTemplate(){return this.round?null:this.networkImagesBySize[this.size]}templateVisual(){return this.imageSrc?(0,a.dy)`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`:(0,a.dy)`<wui-icon size="inherit" color="default" name="networkPlaceholder"></wui-icon>`}};p.styles=[c.ET,u],h([(0,o.Cb)()],p.prototype,"size",void 0),h([(0,o.Cb)()],p.prototype,"name",void 0),h([(0,o.Cb)({type:Object})],p.prototype,"networkImagesBySize",void 0),h([(0,o.Cb)()],p.prototype,"imageSrc",void 0),h([(0,o.Cb)({type:Boolean})],p.prototype,"selected",void 0),h([(0,o.Cb)({type:Boolean})],p.prototype,"round",void 0),h([(0,l.M)("wui-network-image")],p)},69393:function(e,t,r){var a=r(19064),o=r(59662);r(79556);var n=r(24134),i=r(25729),s=r(95636),c=(0,s.iv)`
  :host {
    position: relative;
    display: flex;
    width: 100%;
    height: 1px;
    background-color: ${({tokens:e})=>e.theme.borderPrimary};
    justify-content: center;
    align-items: center;
  }

  :host > wui-text {
    position: absolute;
    padding: 0px 8px;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
  }
`,l=function(e,t,r,a){var o,n=arguments.length,i=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,r):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,a);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(i=(n<3?o(i):n>3?o(t,r,i):o(t,r))||i);return n>3&&i&&Object.defineProperty(t,r,i),i};let d=class extends a.oi{constructor(){super(...arguments),this.text=""}render(){return(0,a.dy)`${this.template()}`}template(){return this.text?(0,a.dy)`<wui-text variant="md-regular" color="secondary">${this.text}</wui-text>`:null}};d.styles=[n.ET,c],l([(0,o.Cb)()],d.prototype,"text",void 0),l([(0,i.M)("wui-separator")],d)},73783:function(e,t,r){r(55018)},16965:function(e,t,r){r.d(t,{W:function(){return o}});var a=r(19064);let o=(0,a.YP)`<svg  viewBox="0 0 48 54" fill="none">
  <path
    d="M43.4605 10.7248L28.0485 1.61089C25.5438 0.129705 22.4562 0.129705 19.9515 1.61088L4.53951 10.7248C2.03626 12.2051 0.5 14.9365 0.5 17.886V36.1139C0.5 39.0635 2.03626 41.7949 4.53951 43.2752L19.9515 52.3891C22.4562 53.8703 25.5438 53.8703 28.0485 52.3891L43.4605 43.2752C45.9637 41.7949 47.5 39.0635 47.5 36.114V17.8861C47.5 14.9365 45.9637 12.2051 43.4605 10.7248Z"
  />
</svg>`},31059:function(e,t,r){var a=r(19064),o=r(59662),n=r(35162),i=r(24134),s=r(25729),c=r(95636),l=(0,c.iv)`
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
`,d=function(e,t,r,a){var o,n=arguments.length,i=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,r):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,a);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(i=(n<3?o(i):n>3?o(t,r,i):o(t,r))||i);return n>3&&i&&Object.defineProperty(t,r,i),i};let u=class extends a.oi{constructor(){super(...arguments),this.src="./path/to/image.jpg",this.alt="Image",this.size=void 0,this.boxed=!1,this.rounded=!1,this.fullSize=!1}render(){let e={inherit:"inherit",xxs:"2",xs:"3",sm:"4",md:"4",mdl:"5",lg:"5",xl:"6",xxl:"7","3xl":"8","4xl":"9","5xl":"10"};return(this.style.cssText=`
      --local-width: ${this.size?`var(--apkt-spacing-${e[this.size]});`:"100%"};
      --local-height: ${this.size?`var(--apkt-spacing-${e[this.size]});`:"100%"};
      `,this.dataset.boxed=this.boxed?"true":"false",this.dataset.rounded=this.rounded?"true":"false",this.dataset.full=this.fullSize?"true":"false",this.dataset.icon=this.iconColor||"inherit",this.icon)?(0,a.dy)`<wui-icon
        color=${this.iconColor||"inherit"}
        name=${this.icon}
        size="lg"
      ></wui-icon> `:this.logo?(0,a.dy)`<wui-icon size="lg" color="inherit" name=${this.logo}></wui-icon> `:(0,a.dy)`<img src=${(0,n.o)(this.src)} alt=${this.alt} @error=${this.handleImageError} />`}handleImageError(){this.dispatchEvent(new CustomEvent("onLoadError",{bubbles:!0,composed:!0}))}};u.styles=[i.ET,l],d([(0,o.Cb)()],u.prototype,"src",void 0),d([(0,o.Cb)()],u.prototype,"logo",void 0),d([(0,o.Cb)()],u.prototype,"icon",void 0),d([(0,o.Cb)()],u.prototype,"iconColor",void 0),d([(0,o.Cb)()],u.prototype,"alt",void 0),d([(0,o.Cb)()],u.prototype,"size",void 0),d([(0,o.Cb)({type:Boolean})],u.prototype,"boxed",void 0),d([(0,o.Cb)({type:Boolean})],u.prototype,"rounded",void 0),d([(0,o.Cb)({type:Boolean})],u.prototype,"fullSize",void 0),d([(0,s.M)("wui-image")],u)},51243:function(e,t,r){var a=r(19064),o=r(59662),n=r(95636),i=r(24134),s=r(25729),c=(0,a.iv)`
  :host {
    display: flex;
  }

  :host([data-size='sm']) > svg {
    width: 12px;
    height: 12px;
  }

  :host([data-size='md']) > svg {
    width: 16px;
    height: 16px;
  }

  :host([data-size='lg']) > svg {
    width: 24px;
    height: 24px;
  }

  :host([data-size='xl']) > svg {
    width: 32px;
    height: 32px;
  }

  svg {
    animation: rotate 1.4s linear infinite;
    color: var(--local-color);
  }

  :host([data-size='md']) > svg > circle {
    stroke-width: 6px;
  }

  :host([data-size='sm']) > svg > circle {
    stroke-width: 8px;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
`,l=function(e,t,r,a){var o,n=arguments.length,i=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,r):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,a);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(i=(n<3?o(i):n>3?o(t,r,i):o(t,r))||i);return n>3&&i&&Object.defineProperty(t,r,i),i};let d=class extends a.oi{constructor(){super(...arguments),this.color="primary",this.size="lg"}render(){let e={primary:n.gR.tokens.theme.textPrimary,secondary:n.gR.tokens.theme.textSecondary,tertiary:n.gR.tokens.theme.textTertiary,invert:n.gR.tokens.theme.textInvert,error:n.gR.tokens.core.textError,warning:n.gR.tokens.core.textWarning,"accent-primary":n.gR.tokens.core.textAccentPrimary};return this.style.cssText=`
      --local-color: ${"inherit"===this.color?"inherit":e[this.color]};
      `,this.dataset.size=this.size,(0,a.dy)`<svg viewBox="0 0 16 17" fill="none">
      <path
        d="M8.75 2.65625V4.65625C8.75 4.85516 8.67098 5.04593 8.53033 5.18658C8.38968 5.32723 8.19891 5.40625 8 5.40625C7.80109 5.40625 7.61032 5.32723 7.46967 5.18658C7.32902 5.04593 7.25 4.85516 7.25 4.65625V2.65625C7.25 2.45734 7.32902 2.26657 7.46967 2.12592C7.61032 1.98527 7.80109 1.90625 8 1.90625C8.19891 1.90625 8.38968 1.98527 8.53033 2.12592C8.67098 2.26657 8.75 2.45734 8.75 2.65625ZM14 7.90625H12C11.8011 7.90625 11.6103 7.98527 11.4697 8.12592C11.329 8.26657 11.25 8.45734 11.25 8.65625C11.25 8.85516 11.329 9.04593 11.4697 9.18658C11.6103 9.32723 11.8011 9.40625 12 9.40625H14C14.1989 9.40625 14.3897 9.32723 14.5303 9.18658C14.671 9.04593 14.75 8.85516 14.75 8.65625C14.75 8.45734 14.671 8.26657 14.5303 8.12592C14.3897 7.98527 14.1989 7.90625 14 7.90625ZM11.3588 10.9544C11.289 10.8846 11.2062 10.8293 11.115 10.7915C11.0239 10.7538 10.9262 10.7343 10.8275 10.7343C10.7288 10.7343 10.6311 10.7538 10.54 10.7915C10.4488 10.8293 10.366 10.8846 10.2963 10.9544C10.2265 11.0241 10.1711 11.107 10.1334 11.1981C10.0956 11.2893 10.0762 11.387 10.0762 11.4856C10.0762 11.5843 10.0956 11.682 10.1334 11.7731C10.1711 11.8643 10.2265 11.9471 10.2963 12.0169L11.7106 13.4312C11.8515 13.5721 12.0426 13.6513 12.2419 13.6513C12.4411 13.6513 12.6322 13.5721 12.7731 13.4312C12.914 13.2904 12.9932 13.0993 12.9932 12.9C12.9932 12.7007 12.914 12.5096 12.7731 12.3687L11.3588 10.9544ZM8 11.9062C7.80109 11.9062 7.61032 11.9853 7.46967 12.1259C7.32902 12.2666 7.25 12.4573 7.25 12.6562V14.6562C7.25 14.8552 7.32902 15.0459 7.46967 15.1866C7.61032 15.3272 7.80109 15.4062 8 15.4062C8.19891 15.4062 8.38968 15.3272 8.53033 15.1866C8.67098 15.0459 8.75 14.8552 8.75 14.6562V12.6562C8.75 12.4573 8.67098 12.2666 8.53033 12.1259C8.38968 11.9853 8.19891 11.9062 8 11.9062ZM4.64125 10.9544L3.22688 12.3687C3.08598 12.5096 3.00682 12.7007 3.00682 12.9C3.00682 13.0993 3.08598 13.2904 3.22688 13.4312C3.36777 13.5721 3.55887 13.6513 3.75813 13.6513C3.95738 13.6513 4.14848 13.5721 4.28937 13.4312L5.70375 12.0169C5.84465 11.876 5.9238 11.6849 5.9238 11.4856C5.9238 11.2864 5.84465 11.0953 5.70375 10.9544C5.56285 10.8135 5.37176 10.7343 5.1725 10.7343C4.97324 10.7343 4.78215 10.8135 4.64125 10.9544ZM4.75 8.65625C4.75 8.45734 4.67098 8.26657 4.53033 8.12592C4.38968 7.98527 4.19891 7.90625 4 7.90625H2C1.80109 7.90625 1.61032 7.98527 1.46967 8.12592C1.32902 8.26657 1.25 8.45734 1.25 8.65625C1.25 8.85516 1.32902 9.04593 1.46967 9.18658C1.61032 9.32723 1.80109 9.40625 2 9.40625H4C4.19891 9.40625 4.38968 9.32723 4.53033 9.18658C4.67098 9.04593 4.75 8.85516 4.75 8.65625ZM4.2875 3.88313C4.1466 3.74223 3.95551 3.66307 3.75625 3.66307C3.55699 3.66307 3.3659 3.74223 3.225 3.88313C3.0841 4.02402 3.00495 4.21512 3.00495 4.41438C3.00495 4.61363 3.0841 4.80473 3.225 4.94562L4.64125 6.35813C4.78215 6.49902 4.97324 6.57818 5.1725 6.57818C5.37176 6.57818 5.56285 6.49902 5.70375 6.35813C5.84465 6.21723 5.9238 6.02613 5.9238 5.82688C5.9238 5.62762 5.84465 5.43652 5.70375 5.29563L4.2875 3.88313Z"
        fill="currentColor"
      />
    </svg>`}};d.styles=[i.ET,c],l([(0,o.Cb)()],d.prototype,"color",void 0),l([(0,o.Cb)()],d.prototype,"size",void 0),l([(0,s.M)("wui-loading-spinner")],d)},14768:function(e,t,r){var a=r(19064),o=r(59662);r(21927),r(51243),r(79556);var n=r(24134),i=r(25729),s=r(95636),c=(0,s.iv)`
  :host {
    width: var(--local-width);
  }

  button {
    width: var(--local-width);
    white-space: nowrap;
    column-gap: ${({spacing:e})=>e[2]};
    transition:
      scale ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-1"]},
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      border-radius ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]};
    will-change: scale, background-color, border-radius;
    cursor: pointer;
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='sm'] {
    border-radius: ${({borderRadius:e})=>e[2]};
    padding: 0 ${({spacing:e})=>e[2]};
    height: 28px;
  }

  button[data-size='md'] {
    border-radius: ${({borderRadius:e})=>e[3]};
    padding: 0 ${({spacing:e})=>e[4]};
    height: 38px;
  }

  button[data-size='lg'] {
    border-radius: ${({borderRadius:e})=>e[4]};
    padding: 0 ${({spacing:e})=>e[5]};
    height: 48px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-variant='accent-primary'] {
    background-color: ${({tokens:e})=>e.core.backgroundAccentPrimary};
    color: ${({tokens:e})=>e.theme.textInvert};
  }

  button[data-variant='accent-secondary'] {
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    color: ${({tokens:e})=>e.core.textAccentPrimary};
  }

  button[data-variant='neutral-primary'] {
    background-color: ${({tokens:e})=>e.theme.backgroundInvert};
    color: ${({tokens:e})=>e.theme.textInvert};
  }

  button[data-variant='neutral-secondary'] {
    background-color: transparent;
    border: 1px solid ${({tokens:e})=>e.theme.borderSecondary};
    color: ${({tokens:e})=>e.theme.textPrimary};
  }

  button[data-variant='neutral-tertiary'] {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    color: ${({tokens:e})=>e.theme.textPrimary};
  }

  button[data-variant='error-primary'] {
    background-color: ${({tokens:e})=>e.core.textError};
    color: ${({tokens:e})=>e.theme.textInvert};
  }

  button[data-variant='error-secondary'] {
    background-color: ${({tokens:e})=>e.core.backgroundError};
    color: ${({tokens:e})=>e.core.textError};
  }

  button[data-variant='shade'] {
    background: var(--wui-color-gray-glass-002);
    color: var(--wui-color-fg-200);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
  }

  /* -- Focus states --------------------------------------------------- */
  button[data-size='sm']:focus-visible:enabled {
    border-radius: 28px;
  }

  button[data-size='md']:focus-visible:enabled {
    border-radius: 38px;
  }

  button[data-size='lg']:focus-visible:enabled {
    border-radius: 48px;
  }
  button[data-variant='shade']:focus-visible:enabled {
    background: var(--wui-color-gray-glass-005);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-gray-glass-010),
      0 0 0 4px var(--wui-color-gray-glass-002);
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) {
    button[data-size='sm']:hover:enabled {
      border-radius: 28px;
    }

    button[data-size='md']:hover:enabled {
      border-radius: 38px;
    }

    button[data-size='lg']:hover:enabled {
      border-radius: 48px;
    }

    button[data-variant='shade']:hover:enabled {
      background: var(--wui-color-gray-glass-002);
    }

    button[data-variant='shade']:active:enabled {
      background: var(--wui-color-gray-glass-005);
    }
  }

  button[data-size='sm']:active:enabled {
    border-radius: 28px;
  }

  button[data-size='md']:active:enabled {
    border-radius: 38px;
  }

  button[data-size='lg']:active:enabled {
    border-radius: 48px;
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    opacity: 0.3;
  }
`,l=function(e,t,r,a){var o,n=arguments.length,i=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,r):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,a);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(i=(n<3?o(i):n>3?o(t,r,i):o(t,r))||i);return n>3&&i&&Object.defineProperty(t,r,i),i};let d={lg:"lg-regular-mono",md:"md-regular-mono",sm:"sm-regular-mono"},u={lg:"md",md:"md",sm:"sm"},h=class extends a.oi{constructor(){super(...arguments),this.size="lg",this.disabled=!1,this.fullWidth=!1,this.loading=!1,this.variant="accent-primary"}render(){this.style.cssText=`
    --local-width: ${this.fullWidth?"100%":"auto"};
     `;let e=this.textVariant??d[this.size];return(0,a.dy)`
      <button data-variant=${this.variant} data-size=${this.size} ?disabled=${this.disabled}>
        ${this.loadingTemplate()}
        <slot name="iconLeft"></slot>
        <wui-text variant=${e} color="inherit">
          <slot></slot>
        </wui-text>
        <slot name="iconRight"></slot>
      </button>
    `}loadingTemplate(){if(this.loading){let e=u[this.size],t="neutral-primary"===this.variant||"accent-primary"===this.variant?"invert":"primary";return(0,a.dy)`<wui-loading-spinner color=${t} size=${e}></wui-loading-spinner>`}return null}};h.styles=[n.ET,n.ZM,c],l([(0,o.Cb)()],h.prototype,"size",void 0),l([(0,o.Cb)({type:Boolean})],h.prototype,"disabled",void 0),l([(0,o.Cb)({type:Boolean})],h.prototype,"fullWidth",void 0),l([(0,o.Cb)({type:Boolean})],h.prototype,"loading",void 0),l([(0,o.Cb)()],h.prototype,"variant",void 0),l([(0,o.Cb)()],h.prototype,"textVariant",void 0),l([(0,i.M)("wui-button")],h)},25004:function(e,t,r){var a=r(19064),o=r(59662),n=r(35162);r(21927);var i=r(24134),s=r(25729),c=r(95636),l=(0,c.iv)`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: ${({borderRadius:e})=>e[2]};
    padding: ${({spacing:e})=>e[1]} !important;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    position: relative;
  }

  :host([data-padding='2']) {
    padding: ${({spacing:e})=>e[2]} !important;
  }

  :host:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  :host > wui-icon {
    z-index: 10;
  }

  /* -- Colors --------------------------------------------------- */
  :host([data-color='accent-primary']) {
    color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  :host([data-color='accent-primary']):after {
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
  }

  :host([data-color='default']),
  :host([data-color='secondary']) {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  :host([data-color='default']):after {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  :host([data-color='secondary']):after {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  :host([data-color='success']) {
    color: ${({tokens:e})=>e.core.iconSuccess};
  }

  :host([data-color='success']):after {
    background-color: ${({tokens:e})=>e.core.backgroundSuccess};
  }

  :host([data-color='error']) {
    color: ${({tokens:e})=>e.core.iconError};
  }

  :host([data-color='error']):after {
    background-color: ${({tokens:e})=>e.core.backgroundError};
  }

  :host([data-color='warning']) {
    color: ${({tokens:e})=>e.core.iconWarning};
  }

  :host([data-color='warning']):after {
    background-color: ${({tokens:e})=>e.core.backgroundWarning};
  }

  :host([data-color='inverse']) {
    color: ${({tokens:e})=>e.theme.iconInverse};
  }

  :host([data-color='inverse']):after {
    background-color: transparent;
  }
`,d=function(e,t,r,a){var o,n=arguments.length,i=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,r):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,a);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(i=(n<3?o(i):n>3?o(t,r,i):o(t,r))||i);return n>3&&i&&Object.defineProperty(t,r,i),i};let u=class extends a.oi{constructor(){super(...arguments),this.icon="copy",this.size="md",this.padding="1",this.color="default"}render(){return this.dataset.padding=this.padding,this.dataset.color=this.color,(0,a.dy)`
      <wui-icon size=${(0,n.o)(this.size)} name=${this.icon} color="inherit"></wui-icon>
    `}};u.styles=[i.ET,i.ZM,l],d([(0,o.Cb)()],u.prototype,"icon",void 0),d([(0,o.Cb)()],u.prototype,"size",void 0),d([(0,o.Cb)()],u.prototype,"padding",void 0),d([(0,o.Cb)()],u.prototype,"color",void 0),d([(0,s.M)("wui-icon-box")],u)},42672:function(e,t,r){var a=r(19064),o=r(59662);r(21927);var n=r(24134),i=r(25729),s=r(95636),c=(0,s.iv)`
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
`,l=function(e,t,r,a){var o,n=arguments.length,i=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,r):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,a);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(i=(n<3?o(i):n>3?o(t,r,i):o(t,r))||i);return n>3&&i&&Object.defineProperty(t,r,i),i};let d=class extends a.oi{constructor(){super(...arguments),this.size="md",this.disabled=!1,this.icon="copy",this.iconColor="default",this.variant="accent"}render(){return(0,a.dy)`
      <button data-variant=${this.variant} ?disabled=${this.disabled} data-size=${this.size}>
        <wui-icon
          color=${({accent:"accent-primary",primary:"inverse",secondary:"default"})[this.variant]||this.iconColor}
          size=${this.size}
          name=${this.icon}
        ></wui-icon>
      </button>
    `}};d.styles=[n.ET,n.ZM,c],l([(0,o.Cb)()],d.prototype,"size",void 0),l([(0,o.Cb)({type:Boolean})],d.prototype,"disabled",void 0),l([(0,o.Cb)()],d.prototype,"icon",void 0),l([(0,o.Cb)()],d.prototype,"iconColor",void 0),l([(0,o.Cb)()],d.prototype,"variant",void 0),l([(0,i.M)("wui-icon-link")],d)},55018:function(e,t,r){var a=r(19064),o=r(59662);r(21927),r(31059);var n=r(24134),i=r(25729);r(25004);var s=r(95636),c=(0,s.iv)`
  :host {
    position: relative;
    background-color: ${({tokens:e})=>e.theme.foregroundTertiary};
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: inherit;
    border-radius: var(--local-border-radius);
  }

  :host([data-image='true']) {
    background-color: transparent;
  }

  :host > wui-flex {
    overflow: hidden;
    border-radius: inherit;
    border-radius: var(--local-border-radius);
  }

  :host([data-size='sm']) {
    width: 32px;
    height: 32px;
  }

  :host([data-size='md']) {
    width: 40px;
    height: 40px;
  }

  :host([data-size='lg']) {
    width: 56px;
    height: 56px;
  }

  :host([name='Extension'])::after {
    border: 1px solid ${({colors:e})=>e.accent010};
  }

  :host([data-wallet-icon='allWallets'])::after {
    border: 1px solid ${({colors:e})=>e.accent010};
  }

  wui-icon[data-parent-size='inherit'] {
    width: 75%;
    height: 75%;
    align-items: center;
  }

  wui-icon[data-parent-size='sm'] {
    width: 32px;
    height: 32px;
  }

  wui-icon[data-parent-size='md'] {
    width: 40px;
    height: 40px;
  }

  :host > wui-icon-box {
    position: absolute;
    overflow: hidden;
    right: -1px;
    bottom: -2px;
    z-index: 1;
    border: 2px solid ${({tokens:e})=>e.theme.backgroundPrimary};
    padding: 1px;
  }
`,l=function(e,t,r,a){var o,n=arguments.length,i=n<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,r):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,r,a);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(i=(n<3?o(i):n>3?o(t,r,i):o(t,r))||i);return n>3&&i&&Object.defineProperty(t,r,i),i};let d=class extends a.oi{constructor(){super(...arguments),this.size="md",this.name="",this.installed=!1,this.badgeSize="xs"}render(){let e="1";return"lg"===this.size?e="4":"md"===this.size?e="2":"sm"===this.size&&(e="1"),this.style.cssText=`
       --local-border-radius: var(--apkt-borderRadius-${e});
   `,this.dataset.size=this.size,this.imageSrc&&(this.dataset.image="true"),this.walletIcon&&(this.dataset.walletIcon=this.walletIcon),(0,a.dy)`
      <wui-flex justifyContent="center" alignItems="center"> ${this.templateVisual()} </wui-flex>
    `}templateVisual(){return this.imageSrc?(0,a.dy)`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`:this.walletIcon?(0,a.dy)`<wui-icon size="md" color="default" name=${this.walletIcon}></wui-icon>`:(0,a.dy)`<wui-icon
      data-parent-size=${this.size}
      size="inherit"
      color="inherit"
      name="wallet"
    ></wui-icon>`}};d.styles=[n.ET,c],l([(0,o.Cb)()],d.prototype,"size",void 0),l([(0,o.Cb)()],d.prototype,"name",void 0),l([(0,o.Cb)()],d.prototype,"imageSrc",void 0),l([(0,o.Cb)()],d.prototype,"walletIcon",void 0),l([(0,o.Cb)({type:Boolean})],d.prototype,"installed",void 0),l([(0,o.Cb)()],d.prototype,"badgeSize",void 0),l([(0,i.M)("wui-wallet-image")],d)},35162:function(e,t,r){r.d(t,{o:function(){return o}});var a=r(33692);let o=e=>e??a.Ld}}]);