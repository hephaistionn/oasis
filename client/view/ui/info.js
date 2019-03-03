module.exports = class Info {

    constructor(model, parent) {

        this.node = document.createElement('div');
        this.node.className = 'info';

        this.container = document.createElement('div');
        this.container.className = 'info__container';

        this.buttonRemove = this.makeNode('info__remove');
        this.buttonRemove.onclick = model.remove.bind(model);


        this.buttonUpgrade = this.makeNode('info__upgrade');
        this.buttonUpgrade.onclick = model.upgrade.bind(model);

        this.nodeTitle = this.makeNode('info__title');
        this.container.appendChild(this.nodeTitle);

        this.nodeDescription = this.makeNode('info__description');
        this.container.appendChild(this.nodeDescription);

        this.nodePicture = document.createElement('IMG');
        this.nodePicture.className = 'info__picture';
        this.container.appendChild(this.nodePicture);

        this.node.appendChild(this.container);

        this.prepareAjustNode(model);

        this.nodeStats = this.makeNode('info__stats');

        this.nodeMaterials = this.makeNode('info__materials');

        this.add(parent);

        this.update(0, model);
    }

    update(dt, model) {
        if(model.entity) {
            if(model.entity.constructor.removable) {
                this.container.appendChild(this.buttonRemove);
            } else if(this.buttonRemove.parentNode) {
                this.container.removeChild(this.buttonRemove);
            }
            if(model.entity.constructor.levelMax && model.entity.constructor.levelMax > model.entity.level) {
                this.container.appendChild(this.buttonUpgrade);
            } else if(this.buttonUpgrade.parentNode) {
                this.container.removeChild(this.buttonUpgrade);
            }

            if(model.entity.ajustResources) {
                this.refreshAjustNode(model);
                if(!this.nodeAjust.parentNode)
                    this.container.appendChild(this.nodeAjust);
            } else if(this.nodeAjust.parentNode) {
                this.container.removeChild(this.nodeAjust);
            }

            if(model.entity.level !== undefined && model.entity.level === 0) {
                if(this.nodeMaterials.parentNode) {
                    this.container.removeChild(this.nodeMaterials);
                }
                this.refreshMaterial(model);
                this.container.appendChild(this.nodeMaterials);
            } else if(this.nodeMaterials.parentNode) {
                this.container.removeChild(this.nodeMaterials);
            }

            
            if(model.entity.constructor.display.length && !this.nodeMaterials.parentNode) {
                    if(this.nodeStats.parentNode)
                        this.container.removeChild(this.nodeStats);
                    this.refreshStats(model);
                    this.container.appendChild(this.nodeStats);
            } else if(this.nodeStats.parentNode) {
                    this.container.removeChild(this.nodeStats);
            }

            this.nodeTitle.textContent = model.entity.constructor.label;
            this.nodeDescription.textContent = model.entity.constructor.description;
            this.nodePicture.src = model.entity.constructor.picture;

        }

        if (model.opened) {
            this.node.style.display = '';
        } else {
            this.node.style.display = 'none';
        }
    }

    makeNode(classname, text) {
        const node = document.createElement('div');
        node.className = classname;
        if (text !== undefined)
            node.textContent = text;
        return node;
    }

    prepareAjustNode(model) {
        this.nodeAjust = this.makeNode('info__ajust');
        this.nodeAjustIcons = [];
        for(let i=0; i<3; i++) {
            const item = this.makeNode('info__ajust__item');
            const label = this.makeNode('info__ajust__item__label', 'Réserver 5/15');
            const arrowLeft = this.makeNode('info__ajust__item__arrow left');
            const arrowRight = this.makeNode('info__ajust__item__arrow right');
            arrowLeft.onclick = model.descreaseAjut.bind(model, i);
            arrowRight.onclick = model.increaseAjut.bind(model, i);
            const icon =  this.makeNode('info__ajust__item__icon');
            item.appendChild(label);
            item.appendChild(arrowLeft);
            item.appendChild(icon);
            item.appendChild(arrowRight);
            this.nodeAjust.appendChild(item);
            this.nodeAjustIcons.push(icon);
        }
    }

    refreshAjustNode(model)  {
        let type;
        for(let i=0; i<3; i++) {
            type = model.entity.currentType[i];
            this.nodeAjustIcons[i].className = `info__ajust__item__icon icon_${type}`;
        }
    }

    refreshStats(model) {
        let value;
        const entity = model.entity;
        const display = model.entity.constructor.display;
        while (this.nodeStats.firstChild) {
            this.nodeStats.removeChild(this.nodeStats.firstChild);
        }
		for (let i=0,l=display.length;i<l;i++) {
            value = entity.stats[display[i]];
            const nodeItem = this.makeNode('info__stats__item');
            const nodeValue =  this.makeNode('info__stats__item__value', value);
            const nodeIcon =  this.makeNode(`info__stats__item__icon icon_${display[i]}`);
            nodeItem.appendChild(nodeIcon);
            nodeItem.appendChild(nodeValue);
            this.nodeStats.appendChild(nodeItem);
		}

    }

    refreshMaterial(model) {
        const entity = model.entity;
        const materials = entity.materials;
        const costs = entity.constructor.cost;
        while (this.nodeMaterials.firstChild) {
            this.nodeMaterials.removeChild(this.nodeMaterials.firstChild);
        }
        const nodeLabel =  this.makeNode('info__materials__label', 'Construction en cours');
        this.nodeMaterials.appendChild(nodeLabel);
        for (let key in costs) {
            const nodeItem = this.makeNode('info__materials__item');
            const nodeValue =  this.makeNode('info__materials__item__value', materials[key] + '/' +costs[key]);
            const nodeIcon =  this.makeNode(`info__materials__item__icon icon_${key}`);
            nodeItem.appendChild(nodeIcon);
            nodeItem.appendChild(nodeValue);
            this.nodeMaterials.appendChild(nodeItem);

        }
    }

    add(parent) {
        parent.appendChild(this.node);
    }

    remove() {
        this.node.parentNode.removeChild(this.node);
    }
};
