const disabled = ' disabled';
const none = 'none';
const empty = '';
const classItem = 'catalog__list__item';

module.exports = class Catalog {

    constructor(model, parent) {

        this.node = this.makeNode('catalog');

        this.currentCategory = 3;

        this.nodeCategories = this.makeNode('catalog__categories v');
        this.node.appendChild(this.nodeCategories);

        this.nodeList = [];
        for (let i = 0; i < model.categories.length; i++) {
            const category = model.categories[i];
            const categoryNodes = this.makeCategory(category, i, model);
            this.node.appendChild(categoryNodes.list);
            this.nodeCategories.appendChild(categoryNodes.button);
            this.nodeList.push(categoryNodes.list);
        }

        this.buttonOpen = this.makeNode('catalog__opener');
        this.buttonOpen.onclick = model.open.bind(model);
        this.node.appendChild(this.buttonOpen);

        this.buttonClose = this.makeNode('catalog__closer');
        this.buttonClose.onclick = model.close.bind(model);
        this.node.appendChild(this.buttonClose);

        this.add(parent);

        this.update(0, model);
    }

    update(dt, model) {

        if (model.displayed) {
            if(this.buttonOpen.style.display !== none) {
                this.buttonOpen.style.display = none;
                this.buttonClose.style.display = empty;
            }
            if(this.nodeCategories.style.display !== empty) {
                this.nodeCategories.style.display = empty;
            }
            if(this.nodeList[model.currentCategory].style.display !== empty) {
                this.nodeList[this.currentCategory].style.display = none;
                this.currentCategory = model.currentCategory;
                this.nodeList[model.currentCategory].style.display = empty;
                this.nodeCategories.className = this.nodeCategories.className.substring(0,21) + model.currentCategory;
            }
            this.refreshItems(model.currentCategory, model); 
        } else {
            this.buttonOpen.style.display = empty;
            this.buttonClose.style.display = none;
            this.nodeCategories.style.display = none;
            this.nodeList[this.currentCategory].style.display = none;
        }
    }

    refreshItems(index, model) {
        const nodeList = this.nodeList[index];
        const category = model.categories[index];
        let entity;
        for (let i = 0; i < category.list.length; i++) {
            entity = category.list[i];
            if (entity) {
                for (let key in entity.cost) {
                    nodeList.children[i].className = classItem;
                    if (entity.cost[key] > model.store.stats[key]) {
                        nodeList.children[i].className += disabled;
                        nodeList.children[i].className += disabled + key;
                    }
                }
            }
        }
    }

    makeCategory(category, index, model) {
        const buttonNode = this.makeNode('catalog__categories__category w'+index);
        const labelNode = this.makeNode('catalog__categories__category__label', category.label);
        buttonNode.appendChild(labelNode);
        buttonNode.onclick = model.openCategory.bind(model, index);

        const listNode = this.makeNode('catalog__list');
        category.list.forEach(item => {
            const nodeItem = this.makeItem(item, model);
            listNode.appendChild(nodeItem);
        })

        listNode.onwheel = (e) => {
            const delta = -Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            listNode.scrollLeft -= (delta * 100); e.preventDefault();
        }

        listNode.style.display = none;
        return { button: buttonNode, list: listNode };
    }

    makeItem(item, model) {
        const nodeItem = this.makeNode('catalog__list__item');
        const nodeItemLabel = this.makeNode('catalog__list__item__label', item.label);
        const nodeItemPic = this.makeNode('catalog__list__item__pic');
        const nodeItemDesc = this.makeNode('catalog__list__item__desc', item.description);
        nodeItemPic.style.backgroundImage = `url(${item.picture})`;
        const nodeCost = this.makeCost(item, model);
        nodeItem.appendChild(nodeItemLabel);
        nodeItem.appendChild(nodeItemPic);
        nodeItem.appendChild(nodeItemDesc);
        nodeItem.appendChild(nodeCost);
        nodeItem.onclick = model.select.bind(model, item);
        return nodeItem;
    }

    makeCost(item, model) {
        const nodeCost = this.makeNode('catalog__list__item__cost');
        if (item) {
            const cost =  item.cost;
            for (let key in cost) {
                const nodeItem = this.makeNode(`catalog__list__item__cost__item code_${key}`);
                nodeItem.appendChild(this.makeNode(`catalog__list__item__cost__icon icon_${key}`));
                nodeItem.appendChild(this.makeNode(`catalog__list__item__cost__value`, cost[key]));
                nodeCost.appendChild(nodeItem);
            }
        }
        return nodeCost;
    }

    makeNode(classname, text) {
        const node = document.createElement('div');
        node.className = classname;
        if (text)
            node.textContent = text;
        return node;
    }

    add(parent) {
        parent.appendChild(this.node);
    }

    remove() {
        this.node.parentNode.removeChild(this.node);
    }
};
