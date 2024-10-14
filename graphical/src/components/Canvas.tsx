import React, { useCallback, useState, useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  NodeTypes,
  OnNodesChange,
  applyNodeChanges,
  applyEdgeChanges,
  Edge,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import TextToShape from './TextToShape';
import { useCanvas } from '../store/CanvasStore';
import { useShapeStore } from '../store/ShapeStore';
import ShapeThumbnail from './ShapeThumbnail';
import ShapeList from './ShapeList';
import CustomShapeNode from './CustomShapeNode';
import ChatWindow from './ChatWindow';
import TextUpdaterNode from './TextUpdaterNode'
import { AnyCnameRecord } from 'dns';
import CustomTextNode from './CustomTextNode';
import styles from './Canvas.module.scss';
import dagre from 'dagre';
import { travelItinerary } from "../store/travelItinerary"

const nodeTypes = {
  customShape: CustomShapeNode,
  textNode: CustomTextNode,
}

// 创建一个函数来生成唯一的ID
const generateId = (() => {
  let id = 0;
  return () => `node_${id++}`;
})();

const PHONE_WIDTH = 360;  // 假设手机屏幕宽度为 360px
const PHONE_HEIGHT = 640; // 假设手机屏幕高度为 640px

const convertItineraryToGraph = (itinerary: typeof travelItinerary): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // 创建行程节点，使用 customShape 类型和手机屏幕大小
  const tripNode = {
    id: generateId(),
    type: 'customShape',
    data: { 
      label: `${itinerary.tripName}\n${itinerary.duration}`,
      itinerary: itinerary,
      width: PHONE_WIDTH,
      height: PHONE_HEIGHT
    },
    position: { x: 0, y: 0 },
    style: { width: PHONE_WIDTH, height: PHONE_HEIGHT }
  };
  nodes.push(tripNode);

  // 创建城市节点和连接
  itinerary.cities.forEach((city, index) => {
    const cityNode = {
      id: generateId(),
      type: 'textNode',
      data: { label: `${city.name}\n${city.duration}` },
      position: { x: 0, y: (index + 1) * 100 },
    };
    nodes.push(cityNode);

    edges.push({
      id: `e${tripNode.id}-${cityNode.id}`,
      source: tripNode.id,
      target: cityNode.id,
      type: 'smoothstep',
    });

    // 创建景点节点和连接
    city.attractions.forEach((attraction, attrIndex) => {
      const attractionNode = {
        id: generateId(),
        type: 'textNode',
        data: { label: `${attraction.name}\n${attraction.duration}` },
        position: { x: 200, y: (index * 200) + (attrIndex * 100) },
      };
      nodes.push(attractionNode);

      edges.push({
        id: `e${cityNode.id}-${attractionNode.id}`,
        source: cityNode.id,
        target: attractionNode.id,
        type: 'smoothstep',
      });
    });
  });

  // 创建活动节点和连接
  itinerary.activities.forEach((activity, index) => {
    const activityNode = {
      id: generateId(),
      type: 'textNode',
      data: { label: `${activity.name}\n${activity.duration}` },
      position: { x: 400, y: index * 100 },
    };
    nodes.push(activityNode);

    const cityNode = nodes.find(node => node.data.label.includes(activity.location));
    if (cityNode) {
      edges.push({
        id: `e${cityNode.id}-${activityNode.id}`,
        source: cityNode.id,
        target: activityNode.id,
        type: 'smoothstep',
      });
    }
  });

  return { nodes, edges };
};

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: node?.style?.width || 172, height: node?.style?.height || 36 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node: any) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    const nodeWidth = node?.style?.width || 172;
    const nodeHeight = node?.style?.height || 36;

    console.log("111 node", node.type, nodeWidth)
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const Canvas: React.FC = () => {
  const [reactFlowInstance, setReactFlowInstance] = useState<any | null>(null);
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const { nodes, edges } = convertItineraryToGraph(travelItinerary);
    return getLayoutedElements(nodes, edges);
  }, []);

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const { updateItemPosition } = useCanvas();
  const [draggedItem, setDraggedItem] = useState<any | null>(null);
  const { shapes, updateShapePosition, updateShapeLayer, updateShapeZIndex } = useShapeStore();

  // const nodes: any[] = useMemo(() => shapes.map((shape: any) => ({
  //   id: shape.id,
  //   type: 'customShape',
  //   position: { x: shape.x, y: shape.y },
  //   width: 100,
  //   height: 100,
  //   draggable: true,
  //   data: { 
  //     shape: shape,
  //     text: shape.text,
  //     backgroundColor: shape.backgroundColor || '#4a4a4a'
  //   },
  // })), [shapes]);

  // const [nodesData, setNodesData] = useState<Node[]>(nodes);

  const [visibleShapes, setVisibleShapes] = useState<Set<string>>(new Set(shapes.map(shape => shape.isVisible ? shape.id : '')));

  // const onNodesChange: OnNodesChange = useCallback(
  //   (changes) => {
  //     const updatedNodes = applyNodeChanges(changes, nodes);
  //     updatedNodes.forEach(node => {
  //       updateShapePosition(node.id, node.position.x, node.position.y);
  //     });
  //   },
  //   [nodes, updateShapePosition]
  // );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedItem) {
      const newX = e.clientX - draggedItem.startX;
      const newY = e.clientY - draggedItem.startY;
      updateItemPosition(draggedItem.id, newX, newY);
    }
  }, [draggedItem, updateItemPosition]);

  const handleMouseUp = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const handleLayerChange = useCallback((id: string, newLayer: number) => {
    updateShapeLayer(id, newLayer);
  }, [updateShapeLayer]);

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    updateShapePosition(id, x, y);
  }, [updateShapePosition]);

  const handleUpdateZIndex = useCallback((id: string, newZIndex: number) => {
    updateShapeZIndex(id, newZIndex);
  }, [updateShapeZIndex]);

  const maxZIndex = useMemo(() => {
    return Math.max(...shapes.map(shape => shape.zIndex || 0), 0);
  }, [shapes]);

  const handleVisibilityChange = (index: number, isVisible: boolean) => {
    setVisibleShapes(prev => {
      const newVisibleShapes = new Set(prev);
      if (isVisible) {
        newVisibleShapes.add(shapes[index].id);
      } else {
        newVisibleShapes.delete(shapes[index].id);
      }
      return newVisibleShapes;
    });
  };

  useEffect(() => {
    setVisibleShapes(prevVisibleShapes => {
      const newVisibleShapes = new Set(prevVisibleShapes);
      shapes.forEach(shape => {
        if (shape.isVisible) {
          newVisibleShapes.add(shape.id);
        } else {
          newVisibleShapes.delete(shape.id);
        }
      });
      return newVisibleShapes;
    });
  }, [shapes]);

  // const onNodesChangeData: any = useCallback(
  //   (changes: any) => setNodesData((nds: any) => applyNodeChanges(changes, nds)),
  //   []
  // );

  // const initialNodes: Node[] = [
  //   {
  //     id: '1',
  //     type: 'textNode',
  //     data: { label: 'Input Node 1' },
  //     position: { x: 100, y: 100 },
  //   },
  //   {
  //     id: '2',
  //     type: 'textNode',
  //     data: { label: 'Input Node 2' },
  //     position: { x: 100, y: 200 },
  //   },
  //   {
  //     id: '3',
  //     type: 'textNode',
  //     data: { label: 'Middle Node' },
  //     position: { x: 300, y: 150 },
  //   },
  //   {
  //     id: '4',
  //     type: 'textNode',
  //     data: { label: 'Output Text Node' },
  //     position: { x: 500, y: 150 },
  //   },
  // ];

  // const initialEdges: Edge[] = [
  //   { 
  //     id: 'e1-3', 
  //     source: '1', 
  //     target: '3', 
  //     sourceHandle: 'right',
  //     targetHandle: 'left',
  //     type: 'smoothstep'
  //   },
  //   { 
  //     id: 'e2-3', 
  //     source: '2', 
  //     target: '3', 
  //     sourceHandle: 'right',
  //     targetHandle: 'left',
  //     type: 'smoothstep'
  //   },
  //   {
  //     id: 'e3-4',
  //     source: '3',
  //     target: '4',
  //     sourceHandle: 'right',
  //     targetHandle: 'left',
  //     type: 'smoothstep',
  //     animated: true 
  //   },
  // ];

  const onNodesChange: any = useCallback(
    (changes: any[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: any = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // const [nodes, setNodes] = useState<Node[]>(initialNodes);
  // const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const rearrangeNodes = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);

    // 使用 requestAnimationFrame 确保在下一帧执行视图调整
    requestAnimationFrame(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({
          padding: 0.2,  // 可以调整这个值来改变边距
          duration: 800  // 动画持续时间，单位为毫秒
        });
      }
    });
  }, [nodes, edges, reactFlowInstance]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        onInit={(instance: any) => setReactFlowInstance(instance)}
      >
        <Background />
        <MiniMap />

        <button
          onClick={rearrangeNodes}
          className={styles.rearrangeButton}
        >
          整理布局
        </button>

        <ShapeThumbnail
          values={shapes}
          onVisibilityChange={handleVisibilityChange}
        >
          {shapes.map((shape: any) => (
            shape.isVisible ? (
              <TextToShape
                key={shape.id}
                data={{
                  ...shape,
                  text: shape.text.substring(0, 10) + (shape.text.length > 10 ? '...' : ''),
                  width: (shape.width ?? 100) / 10,
                  height: (shape.height ?? 100) / 10
                }}
                isThumb={true}
              />
            ) : null
          ))}
        </ShapeThumbnail>
      </ReactFlow>
    </div>
  );
};

export default Canvas;
