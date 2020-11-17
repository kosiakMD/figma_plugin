import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as ReactDOM from 'react-dom';
import './ui.css';
console.log('this', this);
const ID = '903022218808951411';
// function onmessageHandler(event) {
//     const {data} = event;
//     console.log('data', data)
//     const {pluginMessage, pluginId} = data;
//     if (pluginId !== ID) return;
//     console.log('pluginMessage', pluginMessage)
//     const {type} = pluginMessage;
//     // console.log('type', type);
//     if (type === 'select') {
//         const {id, name, value} = pluginMessage;
//         this.setState({id, name, value})
//     }
// }
function onmessageHandler(event, { setId, setName, setValue, setNodeType, setTexts, setPluginData1 }) {
    const { data } = event;
    console.log('data', data);
    const { pluginMessage, pluginId } = data;
    if (pluginId !== ID)
        return;
    console.log('pluginMessage', pluginMessage);
    const { type } = pluginMessage;
    // console.log('type', type);
    if (type === 'all_text') {
        const { texts } = pluginMessage;
        setTexts(texts);
    }
    if (type === 'select') {
        const { id, name, value, nodeType, pluginData1 } = pluginMessage;
        setId(id);
        setName(name);
        setValue(value);
        setNodeType(nodeType);
        setPluginData1(pluginData1);
    }
}
/*class App extends React.Component<{}, State> {
    constructor(props) {
        super(props);

        this.state = {id: '', value: '', name: ''}
    }

    componentDidMount() {
        console.log('componentDidMount');
        onmessage = onmessageHandler.bind(this);
    }

    onCancel = () => {
        parent.postMessage({pluginMessage: {type: 'cancel'}}, '*')
    }
    onNameChange = ({target: {value}}) => {
        console.log(value)
        this.setState({name: value})
    }
    onValueChange = ({target: {value}}) => {
        console.log(value)
        this.setState({value: value})
    }

    onSave = () => {
        const {
            name,
            value,
            id,
        } = this.state;
        parent.postMessage({
            pluginMessage: {
                type: 'update', name, value, id
            }
        }, '*')
    }

    render() {
        const {
            id, name,
            value
        } = this.state;
        return <div>
            <img src={require('../logo.svg')}/>
            <h2>String ID</h2>
            <h3>ID: {id}</h3>
            <span>name: </span><input type="text" value={name} onChange={this.onNameChange}/>
            <span>value: </span><input type="text" value={value} onChange={this.onValueChange}/>
            <button onClick={this.onSave}>Save</button>
        </div>
    }
}*/
const textType = 'TEXT';
// const [isEditMode, toggleMode] = useSwitch(true);
// const useSwitch = (defValue) => {
//     const [edit, setEditMode] = useState(defValue);
//     return useCallback(() => {
//         setEditMode(!edit)
//     }, [edit]);
// }
const FuncApp = () => {
    const [edit, setEditMode] = useState(true);
    const onSwitch = useCallback(() => setEditMode(!edit), [edit]);
    const [texts, setTexts] = useState([]);
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [value, setValue] = useState('');
    const [nodeType, setNodeType] = useState('');
    const [pluginData1, setPluginData1] = useState('');
    useEffect(() => {
        console.log('componentDidMount');
        onmessage = (msg) => onmessageHandler(msg, {
            setId, setName, setValue, setNodeType, setTexts, setPluginData1
        });
        return () => {
            onmessage = undefined;
        };
    }, []);
    return (React.createElement("div", null,
        React.createElement("button", { onClick: onSwitch, style: { padding: '5px 10px', position: 'absolute', top: 5, left: 5 } }, "Switch"),
        edit ? React.createElement(EditTextNode, { id: id, name: name, setName: setName, value: value, setValue: setValue, nodeType: nodeType, pluginData1: pluginData1 }) : React.createElement(ListMode, { texts: texts })));
};
const ListMode = ({ texts }) => {
    console.log('texts', texts);
    const exportLink = useRef(null);
    const onExport = useCallback(() => {
        console.log('exportLink', exportLink);
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(texts));
        // const dlAnchorElem = document.getElementById('downloadAnchorElem');
        const exportLinkElem = exportLink.current;
        exportLinkElem.setAttribute("href", dataStr);
        exportLinkElem.setAttribute("download", "layers.json");
        exportLinkElem.click();
    }, [texts]);
    return (React.createElement("div", null,
        React.createElement("a", { id: "exportLink", style: { display: 'none' }, ref: exportLink }),
        React.createElement("button", { onClick: onExport }, "Export"),
        texts.map(({ id, name, characters }) => React.createElement("div", { key: id, className: "textNodeItem", onClick: () => {
                parent.postMessage({ pluginMessage: { type: 'zoomTo', id } }, '*');
            } },
            React.createElement("div", null, name),
            React.createElement("div", null, characters)))));
};
const EditTextNode = ({ id, name, setName, value, setValue, nodeType, pluginData1, }) => {
    const onCancel = useCallback(() => {
        parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
    }, []);
    const onNameChange = useCallback(({ target: { value } }) => setName(value), []);
    const onValueChange = useCallback(({ target: { value } }) => setValue(value), []);
    const onSave = useCallback(() => {
        parent.postMessage({
            pluginMessage: {
                type: 'update', name, value, id, pluginData1
            }
        }, '*');
    }, [name, value, id]);
    const isTextNode = id && nodeType === textType;
    return React.createElement("div", null,
        React.createElement("h4", null,
            "ID: ",
            id),
        React.createElement("label", { itemID: "name" },
            React.createElement("span", null, "name: "),
            React.createElement("input", { id: "name", type: "text", value: name, onChange: onNameChange, readOnly: !isTextNode })),
        React.createElement("br", null),
        React.createElement("label", { itemID: "value" },
            React.createElement("span", null, "value: "),
            React.createElement("input", { id: "value", type: "text", value: value, onChange: onValueChange, readOnly: !isTextNode })),
        React.createElement("br", null),
        React.createElement("label", { itemID: "value" },
            React.createElement("span", null, "value: "),
            React.createElement("input", { id: "pluginData1", type: "text", value: value, onChange: onValueChange, readOnly: !isTextNode })),
        React.createElement("br", null),
        React.createElement("br", null),
        React.createElement("div", null,
            React.createElement("button", { onClick: onCancel, disabled: !isTextNode }, "Cancel"),
            React.createElement("button", { onClick: onSave, disabled: !isTextNode }, "Save")));
};
ReactDOM.render(React.createElement(FuncApp, null), document.getElementById('react-page'));
