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
  MarkerType,  // 添加这一行
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
import { useNodeStore } from '../store/nodeStore';
import CityNode from './CityNode';
import AttractionNode from './AttractionNode';

const nodeTypes = {
  customShape: CustomShapeNode,
  cityNode: CityNode,
  attractionNode: AttractionNode,
  textNode: CustomTextNode,  // 如果使用的话
};

const convertItineraryToGraph = (itinerary: typeof travelItinerary): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // 创建行程节点
  const tripNode: Node = {
    id: itinerary.id,
    type: 'customShape',
    data: { 
      label: `${itinerary.tripName}\n${itinerary.duration}`,
      itinerary: itinerary,
    },
    position: { x: 0, y: 0 },
    style: { width: 360, height: 640 }
  };
  nodes.push(tripNode);

  // 创建城市节点和连接
  itinerary.cities.forEach((city, index) => {
    const cityNode: Node = {
      id: city.id,
      type: 'cityNode',
      data: {
        type: 'cities',
        city: city,
      },
      position: { x: 370, y: index * 250 },  // 增加垂直间距
      style: { width: 200, height: 80 }
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
      const attractionNode: Node = {
        id: attraction.id,
        type: 'attractionNode',
        data: {
          attraction: attraction,
        },
        position: { x: 600, y: (index * 250) + (attrIndex * 180) },  // 调整位置和间距
        style: { width: 250, height: 130 }
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

  return { nodes, edges };
};

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    const { width, height } = calculateNodeDimensions(node);
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node: any) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    // 将 dagre 节点位置（中心锚点）转换为 React Flow 节点锚点（左上角）
    const { width, height } = calculateNodeDimensions(node);
    node.position = {
      x: nodeWithPosition.x - width / 2,
      y: nodeWithPosition.y - height / 2,
    };

    // 将计算出的尺寸应用到节点上
    node.style = { ...node.style, width, height };

    return node;
  });

  return { nodes, edges };
};

const calculateNodeDimensions = (node: Node): { width: number; height: number } => {
  const defaultDimensions = {
    customShape: { width: 360, height: 640 },
    cityNode: { width: 200, height: 80 },
    attractionNode: { width: 200, height: 80 },
    textNode: { width: 200, height: 80 },
  };

  const nodeWidth = node.style?.width ?? node.width;
  const nodeHeight = node.style?.height ?? node.height;

  console.log("nodeWidth:", nodeWidth);
  console.log("nodeHeight:", nodeHeight);

  if (typeof nodeWidth === 'number' && typeof nodeHeight === 'number') {
    return { width: nodeWidth, height: nodeHeight };
  }

  return defaultDimensions[node.type as keyof typeof defaultDimensions] || { width: 100, height: 50 };
};

const edgeOptions = {
  type: 'smoothstep',
  style: { stroke: '#3498db', strokeWidth: 2 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#3498db',
  },
};

const Canvas: React.FC = () => {
  const [reactFlowInstance, setReactFlowInstance] = useState<any | null>(null);
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const { nodes, edges } = convertItineraryToGraph(travelItinerary);
    return getLayoutedElements(nodes, edges, 'LR');
  }, []);

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const { updateItemPosition } = useCanvas();
  const [draggedItem, setDraggedItem] = useState<any | null>(null);
  const { shapes, updateShapePosition, updateShapeLayer, updateShapeZIndex } = useShapeStore();
  const { selectedNodeId } = useNodeStore();

  const [visibleShapes, setVisibleShapes] = useState<Set<string>>(new Set(shapes.map(shape => shape.isVisible ? shape.id : '')));

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

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      setNodes(updatedNodes);
    },
    [nodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const rearrangeNodes = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      'LR'
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);

    if (reactFlowInstance) {
      reactFlowInstance.fitView();
    }
  }, [nodes, edges, reactFlowInstance]);

  useEffect(() => {
    if (selectedNodeId && reactFlowInstance) {
      const selectedNode = nodes.find(node => node.id === selectedNodeId);
      if (selectedNode) {
        reactFlowInstance.fitView({
          padding: 0.4,
          duration: 800,
          maxZoom: 1.4,
          nodes: [selectedNode],
        });
      }
    }
  }, [selectedNodeId, nodes]);

  useEffect(() => {
    console.log("111 travelItinerary 已更新:", travelItinerary);
    const { nodes: newNodes, edges: newEdges } = convertItineraryToGraph(travelItinerary);
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [travelItinerary]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={edgeOptions}
        fitView
        onInit={(instance: any) => setReactFlowInstance(instance)}
        nodesDraggable={!selectedNodeId}
        nodesConnectable={!selectedNodeId}
        multiSelectionKeyCode={null}
        zoomOnScroll={!selectedNodeId}
        zoomOnPinch={!selectedNodeId}
        panOnScroll={!selectedNodeId}
        panOnDrag={!selectedNodeId}
      >
        <Background />
        <MiniMap />

        <button
          onClick={rearrangeNodes}
          className={styles.rearrangeButton}
        >
          重新排列
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
