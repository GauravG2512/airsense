'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

export type WarehouseSchemaType = 'star' | 'snowflake';
export type WarehouseFactType = 'fact_air_daily' | 'fact_air_measurement';

type SchemaNode = {
  id: string;
  title: string;
  detail: string;
  x: number;
  y: number;
  width?: number;
  kind?: 'fact' | 'dimension';
};

type SchemaEdge = {
  from: string;
  to: string;
  label: string;
  route?: string;
  labelPosition?: { x: number; y: number };
};

type SchemaDiagramProps = {
  schemaType: WarehouseSchemaType;
  factType: WarehouseFactType;
  selectedTable: string;
  onSelectTable: (table: string) => void;
};

const NODE_WIDTH = 230;
const NODE_HEIGHT = 84;

function getDiagram(
  schemaType: WarehouseSchemaType,
  factType: WarehouseFactType
): { nodes: SchemaNode[]; edges: SchemaEdge[]; height: number } {
  const isMeasurement = factType === 'fact_air_measurement';
  const fact: SchemaNode = {
    id: factType,
    title: isMeasurement ? 'FACT_AIR_MEASUREMENT' : 'FACT_AIR_DAILY',
    detail: isMeasurement
      ? 'One station × pollutant × timestamp'
      : 'One station × calendar day',
    x: 550,
    y: 365,
    width: 270,
    kind: 'fact',
  };

  const time: SchemaNode = {
    id: 'dim_time',
    title: 'DIM_TIME',
    detail: 'time_id · calendar attributes',
    x: 550,
    y: 90,
  };
  const station: SchemaNode = {
    id: 'dim_station',
    title: 'DIM_STATION',
    detail: schemaType === 'star'
      ? 'station_id · city and state attributes'
      : 'station_id · city_id, state_id',
    x: 150,
    y: 335,
  };
  const location: SchemaNode = {
    id: 'dim_location',
    title: 'DIM_LOCATION',
    detail: schemaType === 'star'
      ? 'location_id · city and state attributes'
      : 'location_id · city_id',
    x: 950,
    y: 335,
  };
  const source: SchemaNode = {
    id: 'dim_source',
    title: 'DIM_SOURCE',
    detail: 'source_id · monitoring network',
    x: schemaType === 'snowflake' ? 870 : isMeasurement ? 310 : 550,
    y: 590,
  };
  const pollutant: SchemaNode = {
    id: 'dim_pollutant',
    title: 'DIM_POLLUTANT',
    detail: 'pollutant_id · species and unit',
    x: schemaType === 'snowflake' ? 550 : 790,
    y: 590,
  };

  const nodes = [time, station, location, source];
  const edges: SchemaEdge[] = [
    { from: 'dim_time', to: factType, label: isMeasurement ? 'time_id' : 'time_id' },
    { from: 'dim_station', to: factType, label: 'station_id' },
    { from: 'dim_location', to: factType, label: 'location_id' },
    { from: 'dim_source', to: factType, label: 'source_id' },
  ];

  if (isMeasurement) {
    nodes.push(pollutant);
    edges.push({ from: 'dim_pollutant', to: factType, label: 'pollutant_id' });
  }

  if (schemaType === 'snowflake') {
    nodes.push(
      {
        id: 'dim_state',
        title: 'DIM_STATE',
        detail: 'state_id · state_name',
        x: 150,
        y: 710,
      },
      {
        id: 'dim_city',
        title: 'DIM_CITY',
        detail: 'city_id · state_id',
        x: 150,
        y: 520,
      }
    );
    edges.push(
      {
        from: 'dim_state',
        to: 'dim_city',
        label: 'state_id',
        labelPosition: { x: 200, y: 640 },
      },
      {
        from: 'dim_city',
        to: 'dim_station',
        label: 'city_id',
        labelPosition: { x: 200, y: 425 },
      },
      {
        from: 'dim_state',
        to: 'dim_station',
        label: 'state_id',
        route: 'M 35 710 L 25 710 L 25 335 L 35 335',
        labelPosition: { x: 90, y: 590 },
      },
      {
        from: 'dim_city',
        to: 'dim_location',
        label: 'city_id',
        route: 'M 265 520 L 320 270 L 780 270 L 835 335',
        labelPosition: { x: 550, y: 255 },
      }
    );
  }

  return { nodes: [fact, ...nodes], edges, height: schemaType === 'snowflake' ? 820 : 700 };
}

function edgePath(from: SchemaNode, to: SchemaNode) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const fromScale = 1 / Math.max(
    Math.abs(dx) / ((from.width || NODE_WIDTH) / 2),
    Math.abs(dy) / (NODE_HEIGHT / 2),
    0.001
  );
  const toScale = 1 / Math.max(
    Math.abs(dx) / ((to.width || NODE_WIDTH) / 2),
    Math.abs(dy) / (NODE_HEIGHT / 2),
    0.001
  );
  const x1 = from.x + dx * fromScale;
  const y1 = from.y + dy * fromScale;
  const x2 = to.x - dx * toScale;
  const y2 = to.y - dy * toScale;
  return {
    x1,
    y1,
    x2,
    y2,
    labelX: x1 + (x2 - x1) * 0.48,
    labelY: y1 + (y2 - y1) * 0.48 - 8,
  };
}

export function SchemaDiagram({
  schemaType,
  factType,
  selectedTable,
  onSelectTable,
}: SchemaDiagramProps) {
  const { nodes, edges, height } = getDiagram(schemaType, factType);
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  return (
    <div className="overflow-x-auto rounded border border-[#e8e8e8] bg-white">
      <svg
        viewBox={`0 0 1100 ${height}`}
        role="img"
        aria-label={`${schemaType} schema diagram for ${factType}`}
        className="block min-w-[760px] w-full"
        style={{ height: 'auto' }}
      >
        <defs>
          <marker
            id="schema-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
          </marker>
        </defs>

        {edges.map((edge) => {
          const from = nodesById.get(edge.from);
          const to = nodesById.get(edge.to);
          if (!from || !to) return null;
          const path = edgePath(from, to);
          const label = `1 : N · ${edge.label}`;
          const labelWidth = Math.max(54, label.length * 5.5);
          return (
            <g key={`${edge.from}-${edge.to}`}>
              {edge.route ? (
                <path
                  d={edge.route}
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                  markerEnd="url(#schema-arrow)"
                />
              ) : (
                <line
                  x1={path.x1}
                  y1={path.y1}
                  x2={path.x2}
                  y2={path.y2}
                  stroke="#64748b"
                  strokeWidth="2"
                  markerEnd="url(#schema-arrow)"
                />
              )}
              <rect
                x={(edge.labelPosition?.x ?? path.labelX) - labelWidth / 2}
                y={(edge.labelPosition?.y ?? path.labelY) - 13}
                width={labelWidth}
                height="18"
                rx="3"
                fill="white"
              />
              <text
                x={edge.labelPosition?.x ?? path.labelX}
                y={edge.labelPosition?.y ?? path.labelY}
                textAnchor="middle"
                className="fill-[#4d4d4d] text-[10px]"
              >
                {label}
              </text>
            </g>
          );
        })}

        {nodes.map((node) => {
          const isSelected = selectedTable === node.id;
          const width = node.width || NODE_WIDTH;
          return (
            <g
              key={node.id}
              role="button"
              tabIndex={0}
              aria-label={`Inspect ${node.title}`}
              onClick={() => onSelectTable(node.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectTable(node.id);
                }
              }}
              className="cursor-pointer"
            >
              <rect
                x={node.x - width / 2}
                y={node.y - NODE_HEIGHT / 2}
                width={width}
                height={NODE_HEIGHT}
                rx="8"
                fill={node.kind === 'fact' ? '#202020' : isSelected ? '#fff7ed' : '#ffffff'}
                stroke={node.kind === 'fact' ? '#ff682c' : isSelected ? '#ff682c' : '#cbd5e1'}
                strokeWidth={node.kind === 'fact' || isSelected ? '2.5' : '1.5'}
              />
              <text
                x={node.x}
                y={node.y - 7}
                textAnchor="middle"
                className={`font-mono text-[13px] font-semibold ${node.kind === 'fact' ? 'fill-white' : 'fill-[#202020]'}`}
              >
                {node.title}
              </text>
              <text
                x={node.x}
                y={node.y + 17}
                textAnchor="middle"
                className={`font-mono text-[10px] ${node.kind === 'fact' ? 'fill-[#e5e7eb]' : 'fill-[#64748b]'}`}
              >
                {node.detail}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-2 border-t border-[#efefef] py-2 text-[10px] font-mono text-[#64748b]">
        <ArrowRight className="h-3 w-3" />
        <span>One dimension row may relate to many fact rows; arrow points to the foreign key.</span>
      </div>
    </div>
  );
}
