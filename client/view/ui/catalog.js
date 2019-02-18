const disabled = ' disabled';
const none = 'none';
const empty = '';
const classItem = 'catalog__category__list__item';

module.exports = class Catalog {

    constructor(model, parent) {

        this.node = this.makeNode('catalog');

        this.currentCategory = 3;

        this.nodeList = [];
        this.categoryList = [];
        for (let i = 0; i < model.categories.length; i++) {
            const category = model.categories[i];
            const categoryNode = this.makeCategory(category, i, model);
            this.node.appendChild(categoryNode);
            this.categoryList.push(categoryNode);
        }

        this.add(parent);

        this.update(0, model);
    }

    update(dt, model) {


        if(!model.categories[0].opened && this.currentCategory === 0) {
            this.categoryList[this.currentCategory].className = `catalog__category v${this.currentCategory}`;
            this.currentCategory = 3;
        } else if(!model.categories[1].opened && this.currentCategory === 1) {
            this.categoryList[this.currentCategory].className = `catalog__category v${this.currentCategory}`;
            this.currentCategory = 3;
        } else if(!model.categories[2].opened && this.currentCategory === 2) {
            this.categoryList[this.currentCategory].className = `catalog__category v${this.currentCategory}`;
            this.currentCategory = 3;
        }

        if(model.categories[0].opened && this.currentCategory !== 0) {
            this.currentCategory = 0;
            this.categoryList[this.currentCategory].className = `catalog__category v${this.currentCategory} focus`;
            this.currentCategory = 0;
        } else if(model.categories[1].opened && this.currentCategory !== 1) {
            this.currentCategory = 1;
            this.categoryList[this.currentCategory].className = `catalog__category v${this.currentCategory} focus`;
            
        } else if(model.categories[2].opened && this.currentCategory !== 2) {
            this.currentCategory = 2;
            this.categoryList[this.currentCategory].className = `catalog__category v${this.currentCategory} focus`;
        } 

        if(this.currentCategory === 2 || this.currentCategory === 1 || this.currentCategory === 0) {
            this.refreshItems(this.currentCategory, model); 
        }

    }

    refreshItems(index, model) {
        const nodeList = this.nodeList[index].children[0];
        const category = model.categories[index];
        let entity;
        const l = category.list.length+1;
        for (let i = 1; i < l; i++) {
            entity = category.list[i-1];
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
        const groupNode = this.makeNode('catalog__category v'+index);

        const buttonNode = this.makeNode('catalog__category__button  v'+index);
        const labelNode = this.makeNode('catalog__category__button__label');
        buttonNode.appendChild(labelNode);
        buttonNode.onclick = model.openCategory.bind(model, index);
        groupNode.appendChild(buttonNode);

        const listNode = this.makeNode('catalog__category__list');
        const scrollContainer = this.makeNode('catalog__category__list__container');
        const background = this.makeNode('catalog__category__list__background');
        scrollContainer.appendChild(background);

        category.list.forEach(item => {
            const nodeItem = this.makeItem(item, model);
            scrollContainer.appendChild(nodeItem);
        })

        listNode.appendChild(scrollContainer);

        listNode.onwheel = (e) => {
            const delta = -Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            listNode.scrollLeft -= (delta * 100); e.preventDefault();
        }
        this.nodeList.push(listNode);
        groupNode.appendChild(listNode);
        return groupNode;
    }

    makeItem(item, model) {
        const nodeItem = this.makeNode('catalog__category__list__item');
        const nodeItemTopLabel = this.makeNode('catalog__category__list__item__toplabel');
        const nodeItemLabel = this.makeNode('catalog__category__list__item__label', item.label);
        const nodeItemPic = this.makeNode('catalog__category__list__item__pic');
        const nodePic = this.makeNode('catalog__category__list__item__pic__content');
        nodeItemPic.appendChild(nodePic);
        const nodeItemDesc = this.makeNode('catalog__category__list__item__desc', item.description);
        nodePic.style.backgroundImage = `url(${item.picture})`;
        const nodeCost = this.makeCost(item, model);
        nodeItem.appendChild(nodeItemPic);
        nodeItem.appendChild(nodeItemTopLabel);
        nodeItem.appendChild(nodeItemLabel);
        nodeItem.appendChild(nodeItemDesc);
        nodeItem.appendChild(nodeCost);
        nodeItem.onclick = model.select.bind(model, item);
        return nodeItem;
    }

    makeCost(item, model) {
        const nodeCost = this.makeNode('catalog__category__list__item__cost');
        if (item) {
            const cost =  item.cost;
            for (let key in cost) {
                const nodeItem = this.makeNode(`catalog__category__list__item__cost__item code_${key}`);
                nodeItem.appendChild(this.makeNode(`catalog__category__list__item__cost__icon icon_${key}`));
                nodeItem.appendChild(this.makeNode(`catalog__category__list__item__cost__value`, cost[key]));
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
