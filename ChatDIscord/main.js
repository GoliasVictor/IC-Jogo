function findAncestor (el, sel) {
    while ((el = el.parentElement) && !((el.matches || el.matchesSelector).call(el,sel)));
    return el;
}


class Chat extends HTMLElement {
    constructor(){
		super();
    }
	respostaEscolhida(e){
		console.log(e);
		var nodes = this.querySelectorAll("[caminho]");
		nodes.forEach(node=>{
			if(node.getAttribute("caminho") == e.goto)
				node.toggleAttribute("mostrando", true);
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
	
	static get observedAttributes() { return ["usuario"]; }
	attributeChangedCallback(name, oldValue,value){

		if (value != oldValue)
		{
			if(name == "usuario")
			{				
				if(this.comPerfil)
					this.setText(".nome-usuario", value);
				else if (value !== null){
					this.comPerfil = true;

					const template = document.getElementById("template-mensagem-perfil");

					this.shadowRoot.innerHTML="";
					this.shadowRoot.appendChild(template.content.cloneNode(true));
				} 
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

	}
	respostaEscolhida(e){
		e.decisao = this.getAttribute("nome");
		this.style.display = "none";
		var strEvento = this.getAttribute("resposta-escolhida");

		if(strEvento){
			try{
				var ev = eval(strEvento);
				if(typeof ev === 'function')
					ev.call(e);
			}
			catch{}
		}

		findAncestor(this, "c-chat")?.respostaEscolhida(e);
	}
}
class Escolha extends HTMLElement {
    constructor(){
		super();
		this.addEventListener('click', this.handleClick)
    }
	handleClick(){ 
		var e = {
			cd: this.getAttribute("cd"),
			goto: this.getAttribute("goto"),
			target : this,
		}
		findAncestor(this,"c-decisao")?.respostaEscolhida(e);
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