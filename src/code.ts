// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".

setInterval(() => console.log(`I'm alive`), 1e3);

const isText = node => node.type === "TEXT";
const getTextsFromNode = node => node.findAll(isText);

// figma.currentPage.parent.children.map(getTextsFromNode)

// const texts = getPageTexts(figma.currentPage);
const texts = getTextsFromNode(figma.currentPage);
console.log('texts', texts)

figma.showUI(__html__, {
    // width: 200,
    // height: 200,
});

const notify = figma.notify('Hello', {
    timeout: 1000,
});
setTimeout(() => notify.cancel, 500);

const textType = 'TEXT';

figma.ui.postMessage({
    type: 'all_text',
    texts: texts.map(({id, name, characters}) => ({id, name, characters})),
});

figma.on('selectionchange', () => {
    console.log('selectionchange')
    const selected: SceneNode = figma.currentPage.selection[0];
    console.log('selected', selected)
    const id = selected.id;
    const name = selected.name;
    const nodeType = selected.type;
    const pluginData1 = selected.getPluginData('pluginData1');

    // const texts = getTextsFromNode(figma.currentPage.selection);
    // const texts = getTextsFromNode(selected);
    let edit = '';
    let open = '';
    if (isText(selected)) {
        // if (texts) {
        //     if (texts.length > 1) {
        edit = name;
        open = pluginData1;
    } else {
        open = ''
        edit = 'selected multiple';
    }
    // }

    selected.setRelaunchData({
        edit: edit,
        open: open,
        // open: 'open this',
        // close: 'close this',
        // name: 'selectionchange',
        // description: "description 1"
    })

    console.log('pluginData1', pluginData1)
    let value = '';
    if (selected.type === textType) {
        value = selected.characters;
    }
    figma.ui.postMessage({type: 'select', id, name, value, nodeType, pluginData1});

});

console.log('this', this);
// console.log('window', window);
// console.log('__html__', __html__);

// function getPageTexts(page) {
//     const texts = [];
//     // const textType = 'TEXT';
//     // const textClassName = 'TextNode';
//     // const getNodeChildren = (node) => node.children;
//     // const getNodeType = (node) => node.type;
//     // const getClass = (instance) => instance.constructor.name;
//
//     const isText = node => node.type === "TEXT";
//     const getTextsFromNode = node => node.findAll(isText);
//
//     function getTexts(node) {
//         const textsFromNode = getTextsFromNode(node);
//         if (!textsFromNode) return;
//         textsFromNode.map((child) => {
//             texts.push({
//                 id: child.id,
//                 name: child.name,
//                 characters: child.characters,
//             });
//             // with (child) {
//             //     console.log(id);
//             //     // texts.push({
//             //     //     id,
//             //     //     name,
//             //     //     characters,
//             //     // });
//             // }
//             getTexts(child);
//         })
//     }
//
//     getTexts(page);
//     return texts;
// }


// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
    console.log('msg', msg);
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (msg.type === 'create-rectangles') {
        const nodes: SceneNode[] = [];
        for (let i = 0; i < msg.count; i++) {
            const rect = figma.createRectangle();
            rect.x = i * 150;
            rect.fills = [{type: 'SOLID', color: {r: 1, g: 0.5, b: 0}}];
            figma.currentPage.appendChild(rect);
            nodes.push(rect);
        }
        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);
    }
    if (msg.type === 'zoomTo') {
        const {id} = msg;
        const node = figma.getNodeById(id)
        figma.viewport.scrollAndZoomIntoView([node]);
    }
    if (msg.type === 'update') {
        (async () => {
            console.log('msg', msg)
            const {id, value: characters, name, pluginData1} = msg;
            console.log(id, name, characters)
            const textNode = figma.getNodeById(id) as TextNode;
            textNode.setPluginData('pluginData1', pluginData1);
            textNode.name = name;
            await figma.loadFontAsync({family: "Roboto", style: "Regular"});
            textNode.characters = characters;
        })()
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    // figma.closePlugin();
};
