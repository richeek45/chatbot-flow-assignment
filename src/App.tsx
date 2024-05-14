import { ChangeEvent, DragEvent, MouseEvent, useCallback, useState } from 'react';
import ReactFlow, { Background, BackgroundVariant, Connection, Controls, Edge, EdgeChange, MiniMap, Node, NodeChange, addEdge, applyEdgeChanges, applyNodeChanges, useEdgesState, useNodesState, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import TextUpdaterNode from './components/TextUpdaterNode';
import { Button } from './components/ui/button';
import { v4 as uuid } from 'uuid';

const initialEdges = [{ id: 'e1-2', source: '1', target: '2', interactionWidth: 100 }];

export enum NodeTypes {
  TEXT_MESSAGE = "TEXT_MESSAGE"
}

const initialNodes = [
  {
    id: '1',
    type: NodeTypes.TEXT_MESSAGE,
    position: { x: 150, y: 100 },
    data: { id: '1', value: 'Enter text message', selected: false },
  },
  { 
    id: '2', 
    type: NodeTypes.TEXT_MESSAGE,  
    position: { x: 400, y: 200 }, 
    data: { id: '2', value: 'Enter text', selected: false } 
  },
];

const nodeTypes = { 'TEXT_MESSAGE': TextUpdaterNode };
const stateKey = 'state-1';


function App() {
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  const { setViewport } = useReactFlow();

  const selectedNode = nodes.find(node => node.data.selected === true);

  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('text/plain');
    const position = {x: event.clientX, y: event.clientY };

    if (type === NodeTypes.TEXT_MESSAGE) {
      const id = uuid();
      const newNode = {
        id,
        type,
        data: { id, value: 'Enter text message', selected: false },
        position,
      };
  
      setNodes((prevNodes) => [...prevNodes, newNode]);
    }
  }

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleNodeClick= (_: MouseEvent, node: Node) => {
    setNodes((prevNodes) => {
      const updatedNodes = prevNodes.map(currNode => {
        if (currNode.id === node.id) {
          return { ...currNode, data: { ...currNode.data, selected: true }}
        }

        return { ...currNode, data: { ...currNode.data,  selected: false}};
      })

      return updatedNodes;
    })
  }

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setNodes((prevNodes) => {
      return prevNodes.map(currNode => {
        if (currNode.id === selectedNode?.data.id) {
          return { ...currNode, data: { ...currNode.data, value: event.target.value }}
        }
        return currNode;
      })
    })
  }, [selectedNode]);

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      // @ts-expect-error -> type for reactFlowInstance
      const flow = reactFlowInstance?.toObject();
      localStorage.setItem(stateKey, JSON.stringify(flow));
    }
  }, [reactFlowInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(stateKey) ?? '');

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setViewport]);

  return (
    <div>
      <nav className='h-[7vh] bg-slate-200 flex justify-end space-x-6 text-sm font-medium md:space-x-10' >
        <Button size="sm" variant="outline" className='bg-white m-2 rounded-lg' onClick={onSave}>Save Changes</Button>
        <Button size="sm" variant="outline" className='bg-white m-2 rounded-lg' onClick={onRestore}>Restore</Button>
      </nav>
      <div className='flex flex-row justify-between'>
        <div className='w-[80vw] h-[80vh] border-slate-300 reactflow-wrapper'>
          <ReactFlow 
          ref={reactFlowInstance}
          nodes={nodes}
          edges={edges}
          draggable="true"
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect} 
          nodeTypes={nodeTypes}
          onInit={setReactFlowInstance as never}
          onNodeClick={handleNodeClick}
          // fitView
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>

        <div>
          Sidebar
          <TextUpdaterNode data={{ id: '', value: '', selected: false }} />

          {selectedNode && 
          <input 
            id="text" 
            name="text" 
            type="text"
            value={selectedNode.data.value}
            onChange={onChange} 
            placeholder="Edit Text" required
            className=" bg-gray-50 border border-gray-300 text-gray-900 text-xs font-medium rounded-lg 
              focus:border-slate-500  block w-4/5 px-1 py-1 placeholder-gray-400
            "
          /> 
          }
        </div>

      </div>

    </div>
  )
}

export default App
