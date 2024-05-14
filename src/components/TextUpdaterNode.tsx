import { DragEvent } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader } from './ui/card';
import { NodeTypes } from '../App';
 
const handleStyle = { zIndex: 100 };
 
export default function  TextUpdaterNode({ data } : { data: { id: string, value: string, selected: boolean }}) {
  const selectedStyle = data.selected ? 'border-sky-700 border-2' : ''
  
  const onDragStart = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.dataTransfer.setData('text/plain', NodeTypes.TEXT_MESSAGE);
    event.dataTransfer.effectAllowed = 'move'
  }


  return (
    <>
      <Handle type="target" position={Position.Left} id="b" style={handleStyle} />
      <Card draggable onDragStart={onDragStart} className={`w-40 divide-y-1  drop-shadow-lg shadow-sm border-black border-0 rounded-lg ${selectedStyle}`}>
        <CardHeader
          className="noDrag block bg-teal-300 w-full	text-xs font-medium p-1 text-gray-900 dark:text-white rounded-md" 
        >
            Send Message
        </CardHeader>
        <CardContent className='p-1 bg-white'>
          <div >{data.value || 'Enter Text Message'}</div>
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Right} id="a" />
    </>
  );
}