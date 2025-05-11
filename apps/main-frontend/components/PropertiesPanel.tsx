import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";

interface PropertiesPanelProps {
    strokeColor: string;
    fillColor: string;
    strokeWidth: number;
    strokeStyle?: number[];
    onStrokeColorChange: (color: string) => void;
    onFillColorChange: (color: string) => void;
    onStrokeWidthChange: (width: number) => void;
    onStrokeStyleChange?: (style: number[]) => void;
}

const PRESET_COLORS = [
    "#1e1e1e", // Dark gray
    "#343a40", // Charcoal
    "#c92a2a", // Red
    "#a61e4d", // Dark pink
    "#862e9c", // Purple
    "#364fc7", // Blue
    "#1864ab", // Dark blue
    "#087f5b", // Green
    "#2b8a3e", // Dark green
    "#e67700", // Orange
    "#ffffff", // White
    "transparent" // Transparent
];

const STROKE_STYLES = [
    { name: "Solid", pattern: [] },
    { name: "Dashed", pattern: [8, 8] },
    { name: "Dotted", pattern: [2, 4] },
    { name: "Dash-Dot", pattern: [8, 8, 2, 8] }
];

export function PropertiesPanel({
    strokeColor,
    fillColor,
    strokeWidth,
    strokeStyle = [],
    onStrokeColorChange,
    onFillColorChange,
    onStrokeWidthChange,
    onStrokeStyleChange = () => {}
}: PropertiesPanelProps) {
    return (
        <Card className="w-72 bg-white/90 backdrop-blur mt-17">
            <CardContent>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Stroke Color</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={strokeColor === "transparent" ? "#000000" : strokeColor}
                                onChange={(e) => onStrokeColorChange(e.target.value)}
                                className="w-12 h-8 p-0 border-2"
                            />
                            <Input
                                type="text"
                                value={strokeColor}
                                onChange={(e) => onStrokeColorChange(e.target.value)}
                                className="flex-1"
                            />
                        </div>
                        <div className="grid grid-cols-6 gap-2 mt-2">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => onStrokeColorChange(color)}
                                    className={`w-8 h-8 rounded-lg border-2 ${
                                        strokeColor === color ? 'border-blue-500' : 'border-gray-200'
                                    } ${color === 'transparent' ? 'bg-gray-100' : ''}`}
                                    style={{
                                        backgroundColor: color === 'transparent' ? 'transparent' : color,
                                        backgroundImage: color === 'transparent' ? 
                                            'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' 
                                            : 'none',
                                        backgroundSize: '8px 8px',
                                        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Fill Color</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={fillColor === "transparent" ? "#000000" : fillColor}
                                onChange={(e) => onFillColorChange(e.target.value)}
                                className="w-12 h-8 p-0 border-2"
                            />
                            <Input
                                type="text"
                                value={fillColor}
                                onChange={(e) => onFillColorChange(e.target.value)}
                                className="flex-1"
                            />
                        </div>
                        <div className="grid grid-cols-6 gap-2 mt-2">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => onFillColorChange(color)}
                                    className={`w-8 h-8 rounded-lg border-2 ${
                                        fillColor === color ? 'border-blue-500' : 'border-gray-200'
                                    } ${color === 'transparent' ? 'bg-gray-100' : ''}`}
                                    style={{
                                        backgroundColor: color === 'transparent' ? 'transparent' : color,
                                        backgroundImage: color === 'transparent' ? 
                                            'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' 
                                            : 'none',
                                        backgroundSize: '8px 8px',
                                        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Stroke Width</Label>
                        <div className="flex gap-2 items-center">
                            <Input
                                type="range"
                                min="1"
                                max="20"
                                value={strokeWidth}
                                onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
                                className="flex-1"
                            />
                            <Input
                                type="number"
                                min="1"
                                max="20"
                                value={strokeWidth}
                                onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
                                className="w-16"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Stroke Style</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {STROKE_STYLES.map((style) => (
                                <button
                                    key={style.name}
                                    onClick={() => onStrokeStyleChange(style.pattern)}
                                    className={`px-3 py-2 border rounded-lg ${
                                        JSON.stringify(strokeStyle) === JSON.stringify(style.pattern)
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="w-full h-0.5 bg-black"
                                        style={{
                                            backgroundImage: style.pattern.length > 0
                                                ? `repeating-linear-gradient(to right, black 0, black ${style.pattern[0]}px, transparent ${style.pattern[0]}px, transparent ${style.pattern[0] + (style.pattern[1] || 0)}px)`
                                                : 'none'
                                        }}
                                    />
                                    <span className="text-xs mt-1 block">{style.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 