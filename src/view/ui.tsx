import * as React from 'react'
import {useCallback, useEffect, useRef, useState} from 'react'
import * as ReactDOM from 'react-dom'
import './ui.css'

console.log('this', this);

const ID = '903022218808951411';

declare function require(path: string): any

type State = {
    id: string;
    name: string;
    value: string;
}

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
function onmessageHandler(event, {setId, setName, setValue, setNodeType, setTexts, setPluginData1}) {
    const {data} = event;
    console.log('data', data)
    const {pluginMessage, pluginId} = data;
    if (pluginId !== ID) return;
    console.log('pluginMessage', pluginMessage)
    const {type} = pluginMessage;
    // console.log('type', type);
    if (type === 'all_text') {
        const {texts} = pluginMessage;
        setTexts(texts);
    }
    if (type === 'select') {
        const {id, name, value, nodeType, pluginData1} = pluginMessage;
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

    return (
        <div>
            <button onClick={onSwitch} style={{padding: '5px 10px', position: 'absolute', top: 5, left: 5}}>Switch
            </button>
            {/*<img src={require('../logo.svg')}/>*/}
            {/*<h2>Layers</h2>*/}
            {edit ? <EditTextNode
                id={id}
                name={name}
                setName={setName}
                value={value}
                setValue={setValue}
                nodeType={nodeType}
                pluginData1={pluginData1}
                setPluginData1={setPluginData1}
            /> : <ListMode texts={texts}/>}
        </div>
    )
};

const ListMode = ({texts}) => {
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
    }, [texts])

    return (
        <div>
            <a id="exportLink" style={{display: 'none'}} ref={exportLink}/>
            <button onClick={onExport}>Export</button>
            {texts.map(({id, name, characters}) =>
                <div key={id} className="textNodeItem" onClick={() => {
                    parent.postMessage({pluginMessage: {type: 'zoomTo', id}}, '*');
                }}>
                    <div>{name}</div>
                    <div>{characters}</div>
                </div>
            )}
        </div>
    )
}

const EditTextNode = ({
                          id,
                          name,
                          setName,
                          value,
                          setValue,
                          nodeType,
                          pluginData1,
                          setPluginData1,
                      }) => {

    const onCancel = useCallback(() => {
        parent.postMessage({pluginMessage: {type: 'cancel'}}, '*')
    }, []);
    const onNameChange = useCallback(({target: {value}}) => setName(value), []);
    const onValueChange = useCallback(({target: {value}}) => setValue(value), []);
    const onPluginData1Change = useCallback(({target: {value}}) => setPluginData1(value), []);
    const onSave = useCallback(() => {
        parent.postMessage({
            pluginMessage: {
                type: 'update', name, value, id, pluginData1
            }
        }, '*')
    }, [name, value, id, pluginData1]);

    const isTextNode = id && nodeType === textType;

    return <div>
        <h4>ID: {id}</h4>
        {/*<p>Count: <input ref={this.countRef}/></p>*/}
        {/*<button id="create" onClick={this.onCreate}>Create</button>*/}
        <label itemID="name">
            <span>name: </span>
            <input id="name" type="text" value={name} onChange={onNameChange}
                   readOnly={!isTextNode}/>
        </label>
        <br/>
        <label itemID="value">
            <span>value: </span>
            <input id="value" type="text" value={value} onChange={onValueChange}
                   readOnly={!isTextNode}/>
        </label>
        <br/>
        <label itemID="pluginData1">
            <span>pluginData1: </span>
            <input id="pluginData1" type="text" value={pluginData1} onChange={onPluginData1Change}
                   readOnly={!isTextNode}/>
        </label>
        <br/>
        <br/>
        <div>
            <button onClick={onCancel} disabled={!isTextNode}>Cancel</button>
            <button onClick={onSave} disabled={!isTextNode}>Save</button>
        </div>
    </div>
}


ReactDOM.render(<FuncApp/>, document.getElementById('react-page'));
