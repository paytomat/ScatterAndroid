function _sendScatterSimulationRequest(t,e){let r,n='scatterCallback'+e.charAt(0).toUpperCase()+e.slice(1);try{r=JSON.stringify(t)}catch(e){r=t+''}const s=JSON.stringify({params:r,methodName:e,callback:n});return navigator.userAgent===SP_USER_AGENT_ANDROID?WebView.pushMessage(s):navigator.userAgent===SP_USER_AGENT_IOS&&window.webkit.messageHandlers.pushMessage.postMessage(s),callbackResult(n)}function callbackResult(t){return new Promise((e,r)=>{window[t]=function(t){var n=JSON.parse(t);n.hasOwnProperty('isError')&&n.isError?r(n):e(n)}})}class ScatterSimulation{constructor(){}getOrRequestIdentity(){return _sendScatterSimulationRequest('','getOrRequestIdentity')}getArbitrarySignature(t){return _sendScatterSimulationRequest(t,'requestArbitrarySignature')}requestSignature(t){return _sendScatterSimulationRequest(t,'requestSignature')}getAppInfo(){return _sendScatterSimulationRequest('','getAppInfo')}walletLanguage(){return _sendScatterSimulationRequest('','walletLanguage')}getWalletWithAccount(){return _sendScatterSimulationRequest('','getWalletWithAccount')}getEosBalance(t){return _sendScatterSimulationRequest(t,'getEosBalance')}getEosAccountInfo(t){return _sendScatterSimulationRequest(t,'getEosAccountInfo')}getTransactionById(t){return _sendScatterSimulationRequest(t,'getTransactionById')}pushActions(t){return _sendScatterSimulationRequest(t,'pushActions')}pushTransfer(t){return _sendScatterSimulationRequest(t,'pushTransfer')}}const ss=new ScatterSimulation,Blockchains={EOS:'eos',ETH:'eth',TRX:'trx'};class Network{constructor(t='',e='https',r='',n=0,s=Blockchains.EOS,i=''){this.name=t,this.protocol=e,this.host=r,this.port=n,this.blockchain=s,this.chainId=i.toString()}static placeholder(){return new Network}static fromJson(t){const e=Object.assign(Network.placeholder(),t);return e.chainId=e.chainId?e.chainId.toString():'',e}isValid(){return this.protocol.length&&this.host.length&&this.port||this.chainId.length}hostport(){return`${this.host}${this.port?':':''}${this.port}`}}const BLOCKCHAIN_SUPPORT='blockchain_support';class Plugin{constructor(t='',e=''){this.name=t,this.type=e}static placeholder(){return new Plugin}static fromJson(t){return Object.assign(Plugin.placeholder(),t)}isSignatureProvider(){return this.type===BLOCKCHAIN_SUPPORT}}class PluginRepositorySingleton{constructor(){this.plugins=[]}loadPlugin(t){this.plugin(t.name)||this.plugins.push(t)}signatureProviders(){return this.plugins.filter(t=>t.type===BLOCKCHAIN_SUPPORT)}supportedBlockchains(){return this.signatureProviders().map(t=>name)}plugin(t){return this.plugins.find(e=>e.name===t)}async endorsedNetworks(){return await Promise.all(this.signatureProviders().map(async t=>await t.getEndorsedNetwork()))}}const PluginRepository=new PluginRepositorySingleton,throwNoAuth=()=>{},checkForExtension=(t,e=0)=>{if(!(e>50))return window.scatter.isExtension?t(!0):void setTimeout(()=>checkForExtension(t,e+1),100)};class Index{constructor(){this.isExtension=!0,this.identity=null}loadPlugin(t){const e=()=>{if(!this.identity)throw new Error('No Identity')};PluginRepository.loadPlugin(t),t.isSignatureProvider()&&(this[t.name]=t.signatureProvider(e),this[t.name+'Hook']=t.hookProvider)}async isInstalled(){return new Promise(t=>{setTimeout(()=>{t(!1)},3e3),Promise.race([checkForExtension(t)])})}async connect(t,e){return new Promise(r=>{if(!t||!t.length)throw new Error('You must specify a name for this connection');e=Object.assign({initTimeout:1e4,linkTimeout:3e4},e),setTimeout(()=>{r(!1)},e.initTimeout),checkForExtension(r)})}disconnect(){}getIdentity(t){return throwNoAuth(),new Promise((t,e)=>{ss.getOrRequestIdentity().then(e=>{this.identity=e.data,t(e.data)})})}getIdentityFromPermissions(){return throwNoAuth(),new Promise((t,e)=>{ss.getOrRequestIdentity().then(e=>{this.identity=e.data,t(e.data)})})}forgetIdentity(){return throwNoAuth(),new Promise((t,e)=>{this.identity=null,t(!0)})}authenticate(t){return throwNoAuth(),new Promise((t,e)=>{ss.getOrRequestIdentity().then(e=>{this.identity=e.data,t(e.data)})})}getArbitrarySignature(t,e,r='',n=!1){let s={publicKey:t,data:e,whatfor:r,isHash:n};return new Promise((t,e)=>{ss.getArbitrarySignature(s).then(e=>{const r=e.data;t(r)})})}getPublicKey(t){return throwNoAuth(),0}linkAccount(t,e){return throwNoAuth(),0}hasAccountFor(t){return throwNoAuth(),0}suggestNetwork(t){return throwNoAuth(),0}requestTransfer(t,e,r,n={}){return 0}requestSignature(t){return throwNoAuth(),0}createTransaction(t,e,r,n){return throwNoAuth(),0}}const proxy=(t,e)=>new Proxy(t,e);let cache={};class ScatterEOS extends Plugin{constructor(){super(Blockchains.EOS,BLOCKCHAIN_SUPPORT)}signatureProvider(...t){const e=t[0];return(t,r,n={})=>{if(!(t=Network.fromJson(t)).isValid())throw Error.noNetwork();const s=`${t.protocol}`+'://'+`${t.hostport()}`,i=t.hasOwnProperty('chainId')&&t.chainId.length?t.chainId:n.chainId;return proxy(r({httpEndpoint:s,chainId:i}),{get(t,o){let a=null;return(...t)=>{if(t.find(t=>t.hasOwnProperty('keyProvider')))throw Error.usedKeyProvider();const u=async r=>{e();t.find(t=>t.hasOwnProperty('requiredFields'));var n='';await ss.requestSignature(r).then(t=>(n=t.data,''));if(!n)return null;if(n.hasOwnProperty('signatures')){a=n.returnedFields;let e=t.find(t=>t.hasOwnProperty('signProvider'));return e&&n.signatures.push(e.signProvider(r.buf,r.sign)),n.signatures}return n};return new Promise((e,c)=>{r(Object.assign(n,{httpEndpoint:s,signProvider:u,chainId:i}))[o](...t).then(t=>{if(!t.hasOwnProperty('fc'))return t=Object.assign(t,{returnedFields:a}),void e(t);const r=proxy(t,{get:(t,e)=>'then'===e?t[e]:(...r)=>new Promise(async(n,s)=>{t[e](...r).then(t=>{n(Object.assign(t,{returnedFields:a}))}).catch(s)})});e(r)}).catch(t=>c(t))})}}})}}}function inject(){''===SP_USER_AGENT_IOS?SP_USER_AGENT_IOS=navigator.userAgent:''===SP_USER_AGENT_ANDROID&&(SP_USER_AGENT_ANDROID=navigator.userAgent),window.scatter=new Index,window.scatter.loadPlugin(new ScatterEOS),document.dispatchEvent(new CustomEvent('scatterLoaded'))}inject();