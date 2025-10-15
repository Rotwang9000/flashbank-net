"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4457],{92200:function(t,e,o){o.r(e),o.d(e,{W3mTransactionsView:function(){return a}});var r=o(19064),i=o(28740);o(82100),o(55222);var n=(0,r.iv)`
  :host > wui-flex:first-child {
    height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  :host > wui-flex:first-child::-webkit-scrollbar {
    display: none;
  }
`;let a=class extends r.oi{render(){return(0,r.dy)`
      <wui-flex flexDirection="column" .padding=${["0","3","3","3"]} gap="3">
        <w3m-activity-list page="activity"></w3m-activity-list>
      </wui-flex>
    `}};a.styles=n,a=function(t,e,o,r){var i,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,o,r);else for(var c=t.length-1;c>=0;c--)(i=t[c])&&(a=(n<3?i(a):n>3?i(e,o,a):i(e,o))||a);return n>3&&a&&Object.defineProperty(e,o,a),a}([(0,i.Mo)("w3m-transactions-view")],a)},12441:function(t,e,o){o(25004)},69804:function(t,e,o){var r=o(19064),i=o(59662);o(21927),o(79556);var n=o(24134),a=o(25729),c=o(95636),s=(0,c.iv)`
  button {
    border: none;
    background: transparent;
    height: 20px;
    padding: ${({spacing:t})=>t[2]};
    column-gap: ${({spacing:t})=>t[1]};
    border-radius: ${({borderRadius:t})=>t[1]};
    padding: 0 ${({spacing:t})=>t[1]};
    border-radius: ${({spacing:t})=>t[1]};
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-variant='accent'] {
    color: ${({tokens:t})=>t.core.textAccentPrimary};
  }

  button[data-variant='secondary'] {
    color: ${({tokens:t})=>t.theme.textSecondary};
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  button[data-variant='accent']:focus-visible:enabled {
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
  }

  button[data-variant='secondary']:focus-visible:enabled {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button[data-variant='accent']:hover:enabled {
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
  }

  button[data-variant='secondary']:hover:enabled {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
  }

  button[data-variant='accent']:focus-visible {
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
  }

  button[data-variant='secondary']:focus-visible {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`,d=function(t,e,o,r){var i,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,o,r);else for(var c=t.length-1;c>=0;c--)(i=t[c])&&(a=(n<3?i(a):n>3?i(e,o,a):i(e,o))||a);return n>3&&a&&Object.defineProperty(e,o,a),a};let l={sm:"sm-medium",md:"md-medium"},u={accent:"accent-primary",secondary:"secondary"},h=class extends r.oi{constructor(){super(...arguments),this.size="md",this.disabled=!1,this.variant="accent",this.icon=void 0}render(){return(0,r.dy)`
      <button ?disabled=${this.disabled} data-variant=${this.variant}>
        <slot name="iconLeft"></slot>
        <wui-text
          color=${u[this.variant]}
          variant=${l[this.size]}
        >
          <slot></slot>
        </wui-text>
        ${this.iconTemplate()}
      </button>
    `}iconTemplate(){return this.icon?(0,r.dy)`<wui-icon name=${this.icon} size="sm"></wui-icon>`:null}};h.styles=[n.ET,n.ZM,s],d([(0,i.Cb)()],h.prototype,"size",void 0),d([(0,i.Cb)({type:Boolean})],h.prototype,"disabled",void 0),d([(0,i.Cb)()],h.prototype,"variant",void 0),d([(0,i.Cb)()],h.prototype,"icon",void 0),d([(0,a.M)("wui-link")],h)},31059:function(t,e,o){var r=o(19064),i=o(59662),n=o(35162),a=o(24134),c=o(25729),s=o(95636),d=(0,s.iv)`
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
`,l=function(t,e,o,r){var i,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,o,r);else for(var c=t.length-1;c>=0;c--)(i=t[c])&&(a=(n<3?i(a):n>3?i(e,o,a):i(e,o))||a);return n>3&&a&&Object.defineProperty(e,o,a),a};let u=class extends r.oi{constructor(){super(...arguments),this.src="./path/to/image.jpg",this.alt="Image",this.size=void 0,this.boxed=!1,this.rounded=!1,this.fullSize=!1}render(){let t={inherit:"inherit",xxs:"2",xs:"3",sm:"4",md:"4",mdl:"5",lg:"5",xl:"6",xxl:"7","3xl":"8","4xl":"9","5xl":"10"};return(this.style.cssText=`
      --local-width: ${this.size?`var(--apkt-spacing-${t[this.size]});`:"100%"};
      --local-height: ${this.size?`var(--apkt-spacing-${t[this.size]});`:"100%"};
      `,this.dataset.boxed=this.boxed?"true":"false",this.dataset.rounded=this.rounded?"true":"false",this.dataset.full=this.fullSize?"true":"false",this.dataset.icon=this.iconColor||"inherit",this.icon)?(0,r.dy)`<wui-icon
        color=${this.iconColor||"inherit"}
        name=${this.icon}
        size="lg"
      ></wui-icon> `:this.logo?(0,r.dy)`<wui-icon size="lg" color="inherit" name=${this.logo}></wui-icon> `:(0,r.dy)`<img src=${(0,n.o)(this.src)} alt=${this.alt} @error=${this.handleImageError} />`}handleImageError(){this.dispatchEvent(new CustomEvent("onLoadError",{bubbles:!0,composed:!0}))}};u.styles=[a.ET,d],l([(0,i.Cb)()],u.prototype,"src",void 0),l([(0,i.Cb)()],u.prototype,"logo",void 0),l([(0,i.Cb)()],u.prototype,"icon",void 0),l([(0,i.Cb)()],u.prototype,"iconColor",void 0),l([(0,i.Cb)()],u.prototype,"alt",void 0),l([(0,i.Cb)()],u.prototype,"size",void 0),l([(0,i.Cb)({type:Boolean})],u.prototype,"boxed",void 0),l([(0,i.Cb)({type:Boolean})],u.prototype,"rounded",void 0),l([(0,i.Cb)({type:Boolean})],u.prototype,"fullSize",void 0),l([(0,c.M)("wui-image")],u)},22584:function(t,e,o){var r=o(19064),i=o(59662),n=o(25729),a=o(95636),c=(0,a.iv)`
  :host {
    display: block;
    background: linear-gradient(
      90deg,
      ${({tokens:t})=>t.theme.foregroundSecondary} 0%,
      ${({tokens:t})=>t.theme.foregroundTertiary} 50%,
      ${({tokens:t})=>t.theme.foregroundSecondary} 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1s ease-in-out infinite;
    border-radius: ${({borderRadius:t})=>t[2]};
  }

  :host([data-rounded='true']) {
    border-radius: ${({borderRadius:t})=>t[16]};
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`,s=function(t,e,o,r){var i,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,o,r);else for(var c=t.length-1;c>=0;c--)(i=t[c])&&(a=(n<3?i(a):n>3?i(e,o,a):i(e,o))||a);return n>3&&a&&Object.defineProperty(e,o,a),a};let d=class extends r.oi{constructor(){super(...arguments),this.width="",this.height="",this.variant="default",this.rounded=!1}render(){return this.style.cssText=`
      width: ${this.width};
      height: ${this.height};
    `,this.dataset.rounded=this.rounded?"true":"false",(0,r.dy)`<slot></slot>`}};d.styles=[c],s([(0,i.Cb)()],d.prototype,"width",void 0),s([(0,i.Cb)()],d.prototype,"height",void 0),s([(0,i.Cb)()],d.prototype,"variant",void 0),s([(0,i.Cb)({type:Boolean})],d.prototype,"rounded",void 0),s([(0,n.M)("wui-shimmer")],d)},25004:function(t,e,o){var r=o(19064),i=o(59662),n=o(35162);o(21927);var a=o(24134),c=o(25729),s=o(95636),d=(0,s.iv)`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: ${({borderRadius:t})=>t[2]};
    padding: ${({spacing:t})=>t[1]} !important;
    background-color: ${({tokens:t})=>t.theme.backgroundPrimary};
    position: relative;
  }

  :host([data-padding='2']) {
    padding: ${({spacing:t})=>t[2]} !important;
  }

  :host:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: ${({borderRadius:t})=>t[2]};
  }

  :host > wui-icon {
    z-index: 10;
  }

  /* -- Colors --------------------------------------------------- */
  :host([data-color='accent-primary']) {
    color: ${({tokens:t})=>t.core.iconAccentPrimary};
  }

  :host([data-color='accent-primary']):after {
    background-color: ${({tokens:t})=>t.core.foregroundAccent010};
  }

  :host([data-color='default']),
  :host([data-color='secondary']) {
    color: ${({tokens:t})=>t.theme.iconDefault};
  }

  :host([data-color='default']):after {
    background-color: ${({tokens:t})=>t.theme.foregroundPrimary};
  }

  :host([data-color='secondary']):after {
    background-color: ${({tokens:t})=>t.theme.foregroundSecondary};
  }

  :host([data-color='success']) {
    color: ${({tokens:t})=>t.core.iconSuccess};
  }

  :host([data-color='success']):after {
    background-color: ${({tokens:t})=>t.core.backgroundSuccess};
  }

  :host([data-color='error']) {
    color: ${({tokens:t})=>t.core.iconError};
  }

  :host([data-color='error']):after {
    background-color: ${({tokens:t})=>t.core.backgroundError};
  }

  :host([data-color='warning']) {
    color: ${({tokens:t})=>t.core.iconWarning};
  }

  :host([data-color='warning']):after {
    background-color: ${({tokens:t})=>t.core.backgroundWarning};
  }

  :host([data-color='inverse']) {
    color: ${({tokens:t})=>t.theme.iconInverse};
  }

  :host([data-color='inverse']):after {
    background-color: transparent;
  }
`,l=function(t,e,o,r){var i,n=arguments.length,a=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,o,r);else for(var c=t.length-1;c>=0;c--)(i=t[c])&&(a=(n<3?i(a):n>3?i(e,o,a):i(e,o))||a);return n>3&&a&&Object.defineProperty(e,o,a),a};let u=class extends r.oi{constructor(){super(...arguments),this.icon="copy",this.size="md",this.padding="1",this.color="default"}render(){return this.dataset.padding=this.padding,this.dataset.color=this.color,(0,r.dy)`
      <wui-icon size=${(0,n.o)(this.size)} name=${this.icon} color="inherit"></wui-icon>
    `}};u.styles=[a.ET,a.ZM,d],l([(0,i.Cb)()],u.prototype,"icon",void 0),l([(0,i.Cb)()],u.prototype,"size",void 0),l([(0,i.Cb)()],u.prototype,"padding",void 0),l([(0,i.Cb)()],u.prototype,"color",void 0),l([(0,c.M)("wui-icon-box")],u)},35162:function(t,e,o){o.d(e,{o:function(){return i}});var r=o(33692);let i=t=>t??r.Ld}}]);