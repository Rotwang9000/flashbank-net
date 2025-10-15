"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5222],{55222:function(t,e,i){var a,r,s=i(19064),o=i(59662),n=i(1631),c=i(59757),l=i(85340),u=i(83241),p=i(4511),d=i(77500),h=i(51440),m=i(18462),g=i(28740);i(82100),i(12441),i(69804),i(68390);var w=i(35162);i(79556);var y=i(24134);(a=r||(r={})).approve="approved",a.bought="bought",a.borrow="borrowed",a.burn="burnt",a.cancel="canceled",a.claim="claimed",a.deploy="deployed",a.deposit="deposited",a.execute="executed",a.mint="minted",a.receive="received",a.repay="repaid",a.send="sent",a.sell="sold",a.stake="staked",a.trade="swapped",a.unstake="unstaked",a.withdraw="withdrawn";var f=i(25729);i(31059),i(25004);var x=i(95636),b=(0,x.iv)`
  :host > wui-flex {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 40px;
    height: 40px;
    box-shadow: inset 0 0 0 1px ${({tokens:t})=>t.core.glass010};
    background-color: ${({tokens:t})=>t.core.glass010};
  }

  :host([data-no-images='true']) > wui-flex {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
    border-radius: ${({borderRadius:t})=>t[3]} !important;
  }

  :host > wui-flex wui-image {
    display: block;
  }

  :host > wui-flex,
  :host > wui-flex wui-image,
  .swap-images-container,
  .swap-images-container.nft,
  wui-image.nft {
    border-top-left-radius: var(--local-left-border-radius);
    border-top-right-radius: var(--local-right-border-radius);
    border-bottom-left-radius: var(--local-left-border-radius);
    border-bottom-right-radius: var(--local-right-border-radius);
  }

  wui-icon {
    width: 20px;
    height: 20px;
  }

  .swap-images-container {
    position: relative;
    width: 40px;
    height: 40px;
    overflow: hidden;
  }

  .swap-images-container wui-image:first-child {
    position: absolute;
    width: 40px;
    height: 40px;
    top: 0;
    left: 0%;
    clip-path: inset(0px calc(50% + 2px) 0px 0%);
  }

  .swap-images-container wui-image:last-child {
    clip-path: inset(0px 0px 0px calc(50% + 2px));
  }

  wui-flex.status-box {
    position: absolute;
    right: 0;
    bottom: 0;
    transform: translate(20%, 20%);
    border-radius: ${({borderRadius:t})=>t[4]};
    background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
    box-shadow: 0 0 0 2px ${({tokens:t})=>t.theme.backgroundPrimary};
    overflow: hidden;
    width: 16px;
    height: 16px;
  }
`,v=function(t,e,i,a){var r,s=arguments.length,o=s<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,i):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,a);else for(var n=t.length-1;n>=0;n--)(r=t[n])&&(o=(s<3?r(o):s>3?r(e,i,o):r(e,i))||o);return s>3&&o&&Object.defineProperty(e,i,o),o};let $=class extends s.oi{constructor(){super(...arguments),this.images=[],this.secondImage={type:void 0,url:""}}render(){let[t,e]=this.images;this.images.length||(this.dataset.noImages="true");let i=t?.type==="NFT",a=e?.url?"NFT"===e.type:i;return this.style.cssText=`
    --local-left-border-radius: ${i?"var(--apkt-borderRadius-3)":"var(--apkt-borderRadius-5)"};
    --local-right-border-radius: ${a?"var(--apkt-borderRadius-3)":"var(--apkt-borderRadius-5)"};
    `,(0,s.dy)`<wui-flex> ${this.templateVisual()} ${this.templateIcon()} </wui-flex>`}templateVisual(){let[t,e]=this.images,i=t?.type;return 2===this.images.length&&(t?.url||e?.url)?(0,s.dy)`<div class="swap-images-container">
        ${t?.url?(0,s.dy)`<wui-image src=${t.url} alt="Transaction image"></wui-image>`:null}
        ${e?.url?(0,s.dy)`<wui-image src=${e.url} alt="Transaction image"></wui-image>`:null}
      </div>`:t?.url?(0,s.dy)`<wui-image src=${t.url} alt="Transaction image"></wui-image>`:"NFT"===i?(0,s.dy)`<wui-icon size="inherit" color="default" name="nftPlaceholder"></wui-icon>`:(0,s.dy)`<wui-icon size="inherit" color="default" name="coinPlaceholder"></wui-icon>`}templateIcon(){let t,e="accent-primary";return(t=this.getIcon(),this.status&&(e=this.getStatusColor()),t)?(0,s.dy)`
      <wui-flex alignItems="center" justifyContent="center" class="status-box">
        <wui-icon-box size="sm" color=${e} icon=${t}></wui-icon-box>
      </wui-flex>
    `:null}getDirectionIcon(){switch(this.direction){case"in":return"arrowBottom";case"out":return"arrowTop";default:return}}getIcon(){return this.onlyDirectionIcon?this.getDirectionIcon():"trade"===this.type?"swapHorizontal":"approve"===this.type?"checkmark":"cancel"===this.type?"close":this.getDirectionIcon()}getStatusColor(){switch(this.status){case"confirmed":return"success";case"failed":return"error";case"pending":return"inverse";default:return"accent-primary"}}};$.styles=[b],v([(0,o.Cb)()],$.prototype,"type",void 0),v([(0,o.Cb)()],$.prototype,"status",void 0),v([(0,o.Cb)()],$.prototype,"direction",void 0),v([(0,o.Cb)({type:Boolean})],$.prototype,"onlyDirectionIcon",void 0),v([(0,o.Cb)({type:Array})],$.prototype,"images",void 0),v([(0,o.Cb)({type:Object})],$.prototype,"secondImage",void 0),$=v([(0,f.M)("wui-transaction-visual")],$);var k=(0,x.iv)`
  :host {
    width: 100%;
  }

  :host > wui-flex:first-child {
    align-items: center;
    column-gap: ${({spacing:t})=>t[2]};
    padding: ${({spacing:t})=>t[1]} ${({spacing:t})=>t[2]};
    width: 100%;
  }

  :host > wui-flex:first-child wui-text:nth-child(1) {
    text-transform: capitalize;
  }

  wui-transaction-visual {
    width: 40px;
    height: 40px;
  }

  wui-flex {
    flex: 1;
  }

  :host wui-flex wui-flex {
    overflow: hidden;
  }

  :host .description-container wui-text span {
    word-break: break-all;
  }

  :host .description-container wui-text {
    overflow: hidden;
  }

  :host .description-separator-icon {
    margin: 0px 6px;
  }

  :host wui-text > span {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
`,T=function(t,e,i,a){var r,s=arguments.length,o=s<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,i):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,a);else for(var n=t.length-1;n>=0;n--)(r=t[n])&&(o=(s<3?r(o):s>3?r(e,i,o):r(e,i))||o);return s>3&&o&&Object.defineProperty(e,i,o),o};let C=class extends s.oi{constructor(){super(...arguments),this.type="approve",this.onlyDirectionIcon=!1,this.images=[]}render(){return(0,s.dy)`
      <wui-flex>
        <wui-transaction-visual
          .status=${this.status}
          direction=${(0,w.o)(this.direction)}
          type=${this.type}
          .onlyDirectionIcon=${this.onlyDirectionIcon}
          .images=${this.images}
        ></wui-transaction-visual>
        <wui-flex flexDirection="column" gap="1">
          <wui-text variant="lg-medium" color="primary">
            ${r[this.type]||this.type}
          </wui-text>
          <wui-flex class="description-container">
            ${this.templateDescription()} ${this.templateSecondDescription()}
          </wui-flex>
        </wui-flex>
        <wui-text variant="sm-medium" color="secondary"><span>${this.date}</span></wui-text>
      </wui-flex>
    `}templateDescription(){let t=this.descriptions?.[0];return t?(0,s.dy)`
          <wui-text variant="md-regular" color="secondary">
            <span>${t}</span>
          </wui-text>
        `:null}templateSecondDescription(){let t=this.descriptions?.[1];return t?(0,s.dy)`
          <wui-icon class="description-separator-icon" size="sm" name="arrowRight"></wui-icon>
          <wui-text variant="md-regular" color="secondary">
            <span>${t}</span>
          </wui-text>
        `:null}};C.styles=[y.ET,k],T([(0,o.Cb)()],C.prototype,"type",void 0),T([(0,o.Cb)({type:Array})],C.prototype,"descriptions",void 0),T([(0,o.Cb)()],C.prototype,"date",void 0),T([(0,o.Cb)({type:Boolean})],C.prototype,"onlyDirectionIcon",void 0),T([(0,o.Cb)()],C.prototype,"status",void 0),T([(0,o.Cb)()],C.prototype,"direction",void 0),T([(0,o.Cb)({type:Array})],C.prototype,"images",void 0),C=T([(0,f.M)("wui-transaction-list-item")],C),i(22584),i(76630),i(21927);var I=(0,x.iv)`
  wui-flex {
    position: relative;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  wui-image {
    border-radius: ${({borderRadius:t})=>t[128]};
  }

  .fallback-icon {
    color: ${({tokens:t})=>t.theme.iconInverse};
    border-radius: ${({borderRadius:t})=>t[3]};
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  .direction-icon,
  .status-image {
    position: absolute;
    right: 0;
    bottom: 0;
    border-radius: ${({borderRadius:t})=>t[128]};
    border: 2px solid ${({tokens:t})=>t.theme.backgroundPrimary};
  }

  .direction-icon {
    padding: ${({spacing:t})=>t["01"]};
    color: ${({tokens:t})=>t.core.iconSuccess};

    background-color: color-mix(
      in srgb,
      ${({tokens:t})=>t.core.textSuccess} 30%,
      ${({tokens:t})=>t.theme.backgroundPrimary} 70%
    );
  }

  /* -- Sizes --------------------------------------------------- */
  :host([data-size='sm']) > wui-image:not(.status-image),
  :host([data-size='sm']) > wui-flex {
    width: 24px;
    height: 24px;
  }

  :host([data-size='lg']) > wui-image:not(.status-image),
  :host([data-size='lg']) > wui-flex {
    width: 40px;
    height: 40px;
  }

  :host([data-size='sm']) .fallback-icon {
    height: 16px;
    width: 16px;
    padding: ${({spacing:t})=>t[1]};
  }

  :host([data-size='lg']) .fallback-icon {
    height: 32px;
    width: 32px;
    padding: ${({spacing:t})=>t[1]};
  }

  :host([data-size='sm']) .direction-icon,
  :host([data-size='sm']) .status-image {
    transform: translate(40%, 30%);
  }

  :host([data-size='lg']) .direction-icon,
  :host([data-size='lg']) .status-image {
    transform: translate(40%, 10%);
  }

  :host([data-size='sm']) .status-image {
    height: 14px;
    width: 14px;
  }

  :host([data-size='lg']) .status-image {
    height: 20px;
    width: 20px;
  }

  /* -- Crop effects --------------------------------------------------- */
  .swap-crop-left-image,
  .swap-crop-right-image {
    position: absolute;
    top: 0;
    bottom: 0;
  }

  .swap-crop-left-image {
    left: 0;
    clip-path: inset(0px calc(50% + 1.5px) 0px 0%);
  }

  .swap-crop-right-image {
    right: 0;
    clip-path: inset(0px 0px 0px calc(50% + 1.5px));
  }
`,A=function(t,e,i,a){var r,s=arguments.length,o=s<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,i):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,a);else for(var n=t.length-1;n>=0;n--)(r=t[n])&&(o=(s<3?r(o):s>3?r(e,i,o):r(e,i))||o);return s>3&&o&&Object.defineProperty(e,i,o),o};let R={sm:"xxs",lg:"md"},O=class extends s.oi{constructor(){super(...arguments),this.type="approve",this.size="lg",this.statusImageUrl="",this.images=[]}render(){return(0,s.dy)`<wui-flex>${this.templateVisual()} ${this.templateIcon()}</wui-flex>`}templateVisual(){switch(this.dataset.size=this.size,this.type){case"trade":return this.swapTemplate();case"fiat":return this.fiatTemplate();case"unknown":return this.unknownTemplate();default:return this.tokenTemplate()}}swapTemplate(){let[t,e]=this.images;return 2===this.images.length&&(t||e)?(0,s.dy)`
        <wui-image class="swap-crop-left-image" src=${t} alt="Swap image"></wui-image>
        <wui-image class="swap-crop-right-image" src=${e} alt="Swap image"></wui-image>
      `:t?(0,s.dy)`<wui-image src=${t} alt="Swap image"></wui-image>`:null}fiatTemplate(){return(0,s.dy)`<wui-icon
      class="fallback-icon"
      size=${R[this.size]}
      name="dollar"
    ></wui-icon>`}unknownTemplate(){return(0,s.dy)`<wui-icon
      class="fallback-icon"
      size=${R[this.size]}
      name="questionMark"
    ></wui-icon>`}tokenTemplate(){let[t]=this.images;return t?(0,s.dy)`<wui-image src=${t} alt="Token image"></wui-image> `:(0,s.dy)`<wui-icon
      class="fallback-icon"
      name=${"nft"===this.type?"image":"coinPlaceholder"}
    ></wui-icon>`}templateIcon(){return this.statusImageUrl?(0,s.dy)`<wui-image
        class="status-image"
        src=${this.statusImageUrl}
        alt="Status image"
      ></wui-image>`:(0,s.dy)`<wui-icon
      class="direction-icon"
      size=${R[this.size]}
      name=${this.getTemplateIcon()}
    ></wui-icon>`}getTemplateIcon(){return"trade"===this.type?"arrowClockWise":"arrowBottom"}};O.styles=[I],A([(0,o.Cb)()],O.prototype,"type",void 0),A([(0,o.Cb)()],O.prototype,"size",void 0),A([(0,o.Cb)()],O.prototype,"statusImageUrl",void 0),A([(0,o.Cb)({type:Array})],O.prototype,"images",void 0),O=A([(0,f.M)("wui-transaction-thumbnail")],O);var z=(0,x.iv)`
  :host > wui-flex:first-child {
    gap: ${({spacing:t})=>t[2]};
    padding: ${({spacing:t})=>t[3]};
    width: 100%;
  }

  wui-flex {
    display: flex;
    flex: 1;
  }
`;let D=class extends s.oi{render(){return(0,s.dy)`
      <wui-flex alignItems="center">
        <wui-shimmer width="40px" height="40px" rounded></wui-shimmer>
        <wui-flex flexDirection="column" gap="1">
          <wui-shimmer width="124px" height="16px" rounded></wui-shimmer>
          <wui-shimmer width="60px" height="14px" rounded></wui-shimmer>
        </wui-flex>
        <wui-shimmer width="24px" height="12px" rounded></wui-shimmer>
      </wui-flex>
    `}};D.styles=[y.ET,z],D=function(t,e,i,a){var r,s=arguments.length,o=s<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,i):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,a);else for(var n=t.length-1;n>=0;n--)(r=t[n])&&(o=(s<3?r(o):s>3?r(e,i,o):r(e,i))||o);return s>3&&o&&Object.defineProperty(e,i,o),o}([(0,f.M)("wui-transaction-list-item-loader")],D);var P=i(22192),S=(0,g.iv)`
  :host {
    min-height: 100%;
  }

  .group-container[last-group='true'] {
    padding-bottom: ${({spacing:t})=>t["3"]};
  }

  .contentContainer {
    height: 280px;
  }

  .contentContainer > wui-icon-box {
    width: 40px;
    height: 40px;
    border-radius: ${({borderRadius:t})=>t["3"]};
  }

  .contentContainer > .textContent {
    width: 65%;
  }

  .emptyContainer {
    height: 100%;
  }
`,j=function(t,e,i,a){var r,s=arguments.length,o=s<3?e:null===a?a=Object.getOwnPropertyDescriptor(e,i):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,a);else for(var n=t.length-1;n>=0;n--)(r=t[n])&&(o=(s<3?r(o):s>3?r(e,i,o):r(e,i))||o);return s>3&&o&&Object.defineProperty(e,i,o),o};let B="last-transaction",N=class extends s.oi{constructor(){super(),this.unsubscribe=[],this.paginationObserver=void 0,this.page="activity",this.caipAddress=c.R.state.activeCaipAddress,this.transactionsByYear=l.s.state.transactionsByYear,this.loading=l.s.state.loading,this.empty=l.s.state.empty,this.next=l.s.state.next,l.s.clearCursor(),this.unsubscribe.push(c.R.subscribeKey("activeCaipAddress",t=>{t&&this.caipAddress!==t&&(l.s.resetTransactions(),l.s.fetchTransactions(t)),this.caipAddress=t}),c.R.subscribeKey("activeCaipNetwork",()=>{this.updateTransactionView()}),l.s.subscribe(t=>{this.transactionsByYear=t.transactionsByYear,this.loading=t.loading,this.empty=t.empty,this.next=t.next}))}firstUpdated(){this.updateTransactionView(),this.createPaginationObserver()}updated(){this.setPaginationObserver()}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){return(0,s.dy)` ${this.empty?null:this.templateTransactionsByYear()}
    ${this.loading?this.templateLoading():null}
    ${!this.loading&&this.empty?this.templateEmpty():null}`}updateTransactionView(){l.s.resetTransactions(),this.caipAddress&&l.s.fetchTransactions(u.j.getPlainAddress(this.caipAddress))}templateTransactionsByYear(){return Object.keys(this.transactionsByYear).sort().reverse().map(t=>{let e=parseInt(t,10),i=Array(12).fill(null).map((t,i)=>({groupTitle:g.AI.getTransactionGroupTitle(e,i),transactions:this.transactionsByYear[e]?.[i]})).filter(({transactions:t})=>t).reverse();return i.map(({groupTitle:t,transactions:e},a)=>{let r=a===i.length-1;return e?(0,s.dy)`
          <wui-flex
            flexDirection="column"
            class="group-container"
            last-group="${r?"true":"false"}"
            data-testid="month-indexes"
          >
            <wui-flex
              alignItems="center"
              flexDirection="row"
              .padding=${["2","3","3","3"]}
            >
              <wui-text variant="md-medium" color="secondary" data-testid="group-title">
                ${t}
              </wui-text>
            </wui-flex>
            <wui-flex flexDirection="column" gap="2">
              ${this.templateTransactions(e,r)}
            </wui-flex>
          </wui-flex>
        `:null})})}templateRenderTransaction(t,e){let{date:i,descriptions:a,direction:r,images:o,status:n,type:c,transfers:l,isAllNFT:u}=this.getTransactionListItemProps(t);return(0,s.dy)`
      <wui-transaction-list-item
        date=${i}
        .direction=${r}
        id=${e&&this.next?B:""}
        status=${n}
        type=${c}
        .images=${o}
        .onlyDirectionIcon=${u||1===l.length}
        .descriptions=${a}
      ></wui-transaction-list-item>
    `}templateTransactions(t,e){return t.map((i,a)=>{let r=e&&a===t.length-1;return(0,s.dy)`${this.templateRenderTransaction(i,r)}`})}emptyStateActivity(){return(0,s.dy)`<wui-flex
      class="emptyContainer"
      flexGrow="1"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      .padding=${["10","5","10","5"]}
      gap="5"
      data-testid="empty-activity-state"
    >
      <wui-icon-box color="default" icon="wallet" size="xl"></wui-icon-box>
      <wui-flex flexDirection="column" alignItems="center" gap="2">
        <wui-text align="center" variant="lg-medium" color="primary">No Transactions yet</wui-text>
        <wui-text align="center" variant="lg-regular" color="secondary"
          >Start trading on dApps <br />
          to grow your wallet!</wui-text
        >
      </wui-flex>
    </wui-flex>`}emptyStateAccount(){return(0,s.dy)`<wui-flex
      class="contentContainer"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      gap="4"
      data-testid="empty-account-state"
    >
      <wui-icon-box icon="swapHorizontal" size="lg" color="default"></wui-icon-box>
      <wui-flex
        class="textContent"
        gap="2"
        flexDirection="column"
        justifyContent="center"
        flexDirection="column"
      >
        <wui-text variant="md-regular" align="center" color="primary">No activity yet</wui-text>
        <wui-text variant="sm-regular" align="center" color="secondary"
          >Your next transactions will appear here</wui-text
        >
      </wui-flex>
      <wui-link @click=${this.onReceiveClick.bind(this)}>Trade</wui-link>
    </wui-flex>`}templateEmpty(){return"account"===this.page?(0,s.dy)`${this.emptyStateAccount()}`:(0,s.dy)`${this.emptyStateActivity()}`}templateLoading(){return"activity"===this.page?Array(7).fill((0,s.dy)` <wui-transaction-list-item-loader></wui-transaction-list-item-loader> `).map(t=>t):null}onReceiveClick(){p.RouterController.push("WalletReceive")}createPaginationObserver(){let{projectId:t}=d.OptionsController.state;this.paginationObserver=new IntersectionObserver(([e])=>{e?.isIntersecting&&!this.loading&&(l.s.fetchTransactions(u.j.getPlainAddress(this.caipAddress)),h.X.sendEvent({type:"track",event:"LOAD_MORE_TRANSACTIONS",properties:{address:u.j.getPlainAddress(this.caipAddress),projectId:t,cursor:this.next,isSmartAccount:(0,m.r9)(c.R.state.activeChain)===P.y_.ACCOUNT_TYPES.SMART_ACCOUNT}}))},{}),this.setPaginationObserver()}setPaginationObserver(){this.paginationObserver?.disconnect();let t=this.shadowRoot?.querySelector(`#${B}`);t&&this.paginationObserver?.observe(t)}getTransactionListItemProps(t){let e=n.E.formatDate(t?.metadata?.minedAt),i=g.AI.mergeTransfers(t?.transfers),a=g.AI.getTransactionDescriptions(t,i),r=i?.[0],s=!!r&&i?.every(t=>!!t.nft_info),o=g.AI.getTransactionImages(i);return{date:e,direction:r?.direction,descriptions:a,isAllNFT:s,images:o,status:t.metadata?.status,transfers:i,type:t.metadata?.operationType}}};N.styles=S,j([(0,o.Cb)()],N.prototype,"page",void 0),j([(0,o.SB)()],N.prototype,"caipAddress",void 0),j([(0,o.SB)()],N.prototype,"transactionsByYear",void 0),j([(0,o.SB)()],N.prototype,"loading",void 0),j([(0,o.SB)()],N.prototype,"empty",void 0),j([(0,o.SB)()],N.prototype,"next",void 0),j([(0,g.Mo)("w3m-activity-list")],N)}}]);