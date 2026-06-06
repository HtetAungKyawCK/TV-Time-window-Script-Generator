/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TimeMark {
  id: string;
  hour: number; // 0-23
  minute: number; // 0-59
  label: string;
  enabled: boolean;
  colorOverride?: string; // Optional custom color for this line
}

export type LineStyle = 'dashed' | 'dotted' | 'solid';

export type LabelPosition = 'abovebar' | 'belowbar' | 'price_top' | 'price_bottom';

export interface IndicatorSettings {
  indicatorName: string;
  lineStyle: LineStyle;
  lineWidth: number;
  lineColor: string;
  textColor: string;
  showLabels: boolean;
  useBgColor: boolean;
  labelBgColor: string;
  labelPosition: LabelPosition;
  fontSize: 'small' | 'normal' | 'large';
  timezone: string; // Default America/New_York
  times: TimeMark[];
  maxLines: number; // For max_lines_limit input
}
