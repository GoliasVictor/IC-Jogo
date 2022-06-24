const body = document.getElementsByTagName('body')[0];
alert = function(){console.log(arguments)};

const templates = $.parseHTML(`<div><template id="template-mensagem"> 
<li  part="mensagem">
	<div></div>
	<div>
		<div><slot></slot></div>
	</div>
</li>
</template>
<template id="template-mensagem-perfil">  
<li  part="mensagem">
	<img part="perfil" class="perfil" alt="">
	<div>
		<div><span part="nome-usuario" class="nome-usuario"></span></div>
		<div ><slot></slot></div>
	</div>
</li>
</template></div>`)[0];

body.appendChild(templates);
$(document).on(':passagestart', function (e) {

});

$(document).on(':passagerender', function (e) {
	for( const chat of $(e.content).find("c-chat") )
		chat.iniciar();
});


const globalTags = new Map();


function sleep(time) {
   	return new Promise((resolve)=> setTimeout(resolve, time));
}


const Usuarios=[
	{
		id:"jogador",
		get nome() {return  SugarCube.State.getVar("$nomeJogador") || "jogador";},
		icon:"https://cdn.discordapp.com/avatars/546981655521525781/e8ee86d4f6177a1c59e41231fed70569.webp?size=80"
	},
	{
		id:"cris",
		nome:"Cris",
		icon:"./imgs/cris-icon.jpg"
	},
	{
		id:"tomate",
		nome:"Tomate",
		icon:"./imgs/tomate-icon.jpg"
	}
]

class Chat extends HTMLElement {
    constructor(){
		super();
		$(this).on("respostaEscolhida",this.respostaEscolhida);
		this.tagsEscolhidas = globalTags;
    }
	iniciar(){
		let inicio;
		if( inicio = this.getAttribute("inicio")){

			this.mostrarCaminho(inicio);
		}
	}

	static get observedAttributes() { return ["inicio"]; }
	attributeChangedCallback(name, oldValue,value){

		if (value != oldValue)
		{
			if(name == "inicio")
			{					
				this.mostrarCaminho(value);
			}
		}
	}
	async respostaEscolhida(e)
	{
		const detalhes = e.detail
		if(detalhes.mensagem !== null)
			await this.adicionarMensagem(detalhes.mensagem)

		if(detalhes.goto !== null)
			this.mostrarCaminho(detalhes.goto,true)
		
		for(const tag of detalhes.tags ){
			let oldValue = this.tagsEscolhidas.get(tag);
			if(oldValue !== null && typeof oldValue === "undefined" )
				oldValue = 0;
			this.tagsEscolhidas.set(tag, oldValue+1)
		} 

	}
	async adicionarMensagem(mensagem){
		$(this).append(`<c-mensagem uid="${mensagem.uid}">${mensagem.conteudo}</c-mensagem>`);
		await sleep(1000);

	}
	async mostrarCaminho(caminho, delay ){
		const self = this;
		if(caminho == null)
			return;
		const nodes = this.querySelectorAll("[caminho]");
		function AdicionarFilho(nodePai){
			
			const node = nodePai.firstChild;
			if(!node)
				return;
			self.append(node);
			self.scrollTop = self.scrollHeight;
			if(node.tagName && node.matches("c-import")){
				self.mostrarCaminho($(node).attr("cid"))
				$(node).remove();
			}
			if(delay && node.tagName)
				setTimeout(()=> AdicionarFilho(nodePai), 2000);
			else	
				AdicionarFilho(nodePai);	
			
			
		}
		nodes.forEach(node => {
			if(node.getAttribute("caminho") == caminho)
				AdicionarFilho(node);
		})
	}
}


class Mensagem extends HTMLElement{ 

	constructor(){
		super();
		const template = document.getElementById("template-mensagem");
		
		let shadow = this.attachShadow({mode: 'open'})	
			this.shadowRoot.appendChild(template.content.cloneNode(true))

		
	}
	
	static get observedAttributes() { return ["uid"]; }
	attributeChangedCallback(name, oldValue,value){

		if (value != oldValue)
		{
			if(name == "uid")
			{				
				if(this.comPerfil)
					this.AtualizarUsuario(value);
				else if (value !== null){
					this.comPerfil = true;

					const template = document.getElementById("template-mensagem-perfil");
					this.shadowRoot.innerHTML="";
					this.shadowRoot.appendChild(template.content.cloneNode(true));
				} 
				this.AtualizarUsuario(value)
			}
		}
	}
	AtualizarUsuario(nome){
		const root = $(this.shadowRoot);
		if(this.comPerfil){
			const usuario = Usuarios.find((u)=> u.id == nome );
			if(usuario){
				root.find(".nome-usuario").text(usuario.nome);
				root.find(".perfil").attr('src', usuario.icon);
			}
		}
	}
	setText(selector, value){
		this.shadowRoot.querySelector(selector).textContent = value;
	}

}
class Decisao extends HTMLElement{
	constructor(){
		super();
		$(this).on("respostaEscolhida",this.respostaEscolhida);
	}
	respostaEscolhida(e){
		
		e.detail.decisao = this.getAttribute("nome");
		const strEvento = this.getAttribute("resposta-escolhida");

		if(strEvento){
			try{
				let ev; 
				(function(){
					ev = eval(strEvento);
				}).call(this);
				if(typeof ev === 'function')
					ev.call(this,e);
			}
			catch{}
		}
		this.parentNode.removeChild(this);
	}
}
class Escolha extends HTMLElement {
    constructor(){
		super();
		$(this).on('click', this.handleClick)
    }
	handleClick(){ 
		const e =  new CustomEvent("respostaEscolhida",{
			bubbles: true,
			cancelable: true,
			detail:{
				cd: this.getAttribute("cd"),
				goto: this.getAttribute("goto"),
				mensagem: null,
				tags: []
			}
		})
		if(this.hasAttribute("mensagem")){
			e.detail.mensagem = {
				uid:"jogador", 
				conteudo: this.innerText
			}
		}
		const attrTag = this.getAttribute("tag");
		if( attrTag != null){
			const tags = attrTag.split(";");
			if(tags.length > 0 )
				e.detail.tags = tags;
		}
		
		this.dispatchEvent(e);
	}
}

class Caminho extends HTMLElement{
	constructor(){
		super();
	}
}
customElements.define("c-chat", Chat)
customElements.define("c-mensagem", Mensagem)
customElements.define("c-escolha", Escolha)
customElements.define("c-decisao", Decisao)
customElements.define("c-caminho", Caminho)




