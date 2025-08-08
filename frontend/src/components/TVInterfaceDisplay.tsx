import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { tvInterfacesAPI, TVInterfaceAPI } from '@/api/tvInterfaces';
import { tvInterfaceMarksAPI, TVInterfaceMark } from '@/api/tvInterfaceMarks';
import {
  Monitor,
  Target,
  MousePointer,
  Loader2,
  Eye,
  Hand,
  Info,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface TVInterfaceDisplayProps {
  // TV Interface data
  tvInterfaceId?: string;
  stepId?: string;
  
  // Display options
  className?: string;
  width?: number;
  height?: number;
  
  // Interactive options
  showAllMarks?: boolean;
  highlightActiveMarks?: boolean;
  showHints?: boolean;
  enableAnimations?: boolean;
  
  // Step-specific highlighting
  currentStepNumber?: number;
  tvAreaPosition?: { x: number; y: number };
  
  // Callbacks
  onMarkClick?: (mark: TVInterfaceMark) => void;
  onMarkHover?: (mark: TVInterfaceMark | null) => void;
}

interface MarkDisplayProps {
  mark: TVInterfaceMark;
  isActive: boolean;
  isHovered: boolean;
  containerWidth: number;
  containerHeight: number;
  onMarkClick?: (mark: TVInterfaceMark) => void;
  onMarkHover?: (mark: TVInterfaceMark | null) => void;
}

const MarkDisplay: React.FC<MarkDisplayProps> = ({
  mark,
  isActive,
  isHovered,
  containerWidth,
  containerHeight,
  onMarkClick,
  onMarkHover,
}) => {
  const baseSize = Math.min(containerWidth, containerHeight);
  const scaleX = containerWidth / 800; // Assuming 800px base width
  const scaleY = containerHeight / 450; // Assuming 450px base height
  
  const scaledPosition = {
    x: (mark.position.x * scaleX),
    y: (mark.position.y * scaleY),
  };
  
  const scaledSize = mark.size ? {
    width: mark.size.width * scaleX,
    height: mark.size.height * scaleY,
  } : {
    width: 32 * (baseSize / 800),
    height: 32 * (baseSize / 800),
  };

  const getMarkStyles = () => {
    // Determine border width and style based on state
    const borderWidth = isActive ? 3 : mark.border_width;
    const borderColor = mark.border_color || mark.color;

    // Build transform with conditional scaling
    let transform = 'translate(-50%, -50%)';
    if (isHovered) {
      transform = 'translate(-50%, -50%) scale(1.1)';
    }

    // Build box shadow based on state
    let boxShadow = undefined;
    if (isHovered) {
      boxShadow = `0 0 20px ${mark.color}`;
    }
    if (isActive) {
      boxShadow = `0 0 30px ${mark.color}, 0 0 60px ${mark.color}40`;
    }

    const styles: React.CSSProperties = {
      position: 'absolute',
      left: `${scaledPosition.x}px`,
      top: `${scaledPosition.y}px`,
      width: mark.shape === 'circle' ? `${scaledSize.height}px` : `${scaledSize.width}px`,
      height: `${scaledSize.height}px`,
      borderRadius: mark.shape === 'circle' ? '50%' : '4px',
      borderWidth: `${borderWidth}px`,
      borderStyle: 'solid',
      borderColor: borderColor,
      backgroundColor: mark.background_color || `${mark.color}${Math.round(mark.opacity * 255).toString(16).padStart(2, '0')}`,
      cursor: mark.is_clickable ? 'pointer' : 'default',
      zIndex: isActive ? 50 : 30,
      transition: 'all 0.3s ease',
      transform,
      boxShadow,
    };

    // Add animation classes
    let animationClass = '';
    if (mark.animation && mark.animation !== 'none') {
      switch (mark.animation) {
        case 'pulse':
          animationClass = 'animate-pulse';
          break;
        case 'blink':
          animationClass = 'animate-ping';
          break;
        case 'bounce':
          animationClass = 'animate-bounce';
          break;
        default:
          break;
      }
    }

    return { styles, animationClass };
  };

  const { styles, animationClass } = getMarkStyles();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (mark.is_clickable && onMarkClick) {
      onMarkClick(mark);
    }
  };

  const handleMouseEnter = () => {
    if (onMarkHover) {
      onMarkHover(mark);
    }
  };

  const handleMouseLeave = () => {
    if (onMarkHover) {
      onMarkHover(null);
    }
  };

  return (
    <>
      {/* Main mark */}
      <div
        className={`${animationClass} ${isActive ? 'z-50' : 'z-30'}`}
        style={styles}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={mark.tooltip_text || mark.name}
      >
        {/* Inner content based on mark type */}
        {mark.mark_type === 'point' && (
          <div className="w-full h-full flex items-center justify-center">
            <Target className="w-4 h-4 text-white" style={{ fontSize: `${scaledSize.width * 0.4}px` }} />
          </div>
        )}
        
        {mark.mark_type === 'zone' && mark.is_clickable && (
          <div className="absolute top-1 right-1">
            <Hand className="w-3 h-3 text-white" />
          </div>
        )}

        {/* Priority indicator */}
        {mark.priority === 'critical' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
        )}
        {mark.priority === 'high' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-white" />
        )}
      </div>

      {/* Glow effect for active marks */}
      {isActive && mark.animation === 'glow' && (
        <div
          className="absolute animate-pulse pointer-events-none"
          style={{
            left: `${scaledPosition.x}px`,
            top: `${scaledPosition.y}px`,
            width: `${scaledSize.width * 1.5}px`,
            height: `${scaledSize.height * 1.5}px`,
            borderRadius: mark.shape === 'circle' ? '50%' : '8px',
            backgroundColor: `${mark.color}20`,
            border: `2px solid ${mark.color}60`,
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
          }}
        />
      )}

      {/* Label for hovered/active marks */}
      {(isHovered || isActive) && mark.name && (
        <div
          className="absolute bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none z-60"
          style={{
            left: `${scaledPosition.x}px`,
            top: `${scaledPosition.y - scaledSize.height / 2 - 30}px`,
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
          }}
        >
          {mark.name}
        </div>
      )}
    </>
  );
};

const TVInterfaceDisplay: React.FC<TVInterfaceDisplayProps> = ({
  tvInterfaceId,
  stepId,
  className = '',
  width,
  height,
  showAllMarks = true,
  highlightActiveMarks = true,
  showHints = true,
  enableAnimations = true,
  currentStepNumber,
  tvAreaPosition,
  onMarkClick,
  onMarkHover,
}) => {
  // State
  const [tvInterface, setTVInterface] = useState<TVInterfaceAPI | null>(null);
  const [marks, setMarks] = useState<TVInterfaceMark[]>([]);
  const [stepMarks, setStepMarks] = useState<TVInterfaceMark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredMark, setHoveredMark] = useState<TVInterfaceMark | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 450 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Load TV interface data
  useEffect(() => {
    const loadTVInterface = async () => {
      if (!tvInterfaceId) {
        setTVInterface(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await tvInterfacesAPI.getById(tvInterfaceId);
        if (response.success && response.data) {
          setTVInterface(response.data);
        } else {
          setError(response.error || 'Не удалось загрузить TV интерфейс');
        }
      } catch (err) {
        setError('Ошибка при загрузке TV интерфейса');
        console.error('Error loading TV interface:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTVInterface();
  }, [tvInterfaceId]);

  // Load marks for TV interface with rate limit handling
  useEffect(() => {
    const loadMarks = async () => {
      if (!tvInterfaceId) {
        setMarks([]);
        return;
      }

      try {
        const response = await tvInterfaceMarksAPI.getByTVInterfaceId(tvInterfaceId, {
          is_active: true,
          is_visible: true,
        });

        if (response.success && response.data) {
          setMarks(response.data);
        } else if (response.error?.includes('429') || response.error?.includes('много запросов')) {
          console.warn('Rate limited - will retry marks loading later');
          // Retry after a delay
          setTimeout(() => loadMarks(), 5000);
        }
      } catch (err: any) {
        if (err.message?.includes('429') || err.message?.includes('много запросов')) {
          console.warn('Rate limited - will retry marks loading later');
          setTimeout(() => loadMarks(), 5000);
        } else {
          console.error('Error loading TV interface marks:', err);
        }
      }
    };

    // Add a small delay to avoid rapid-fire API calls
    const timeoutId = setTimeout(loadMarks, 100);
    return () => clearTimeout(timeoutId);
  }, [tvInterfaceId]);

  // Load marks for current step with rate limit handling
  useEffect(() => {
    const loadStepMarks = async () => {
      if (!stepId) {
        setStepMarks([]);
        return;
      }

      try {
        const response = await tvInterfaceMarksAPI.getByStepId(stepId);
        if (response.success && response.data) {
          setStepMarks(response.data);
        } else if (response.error?.includes('429') || response.error?.includes('много запросов')) {
          console.warn('Rate limited - will retry step marks loading later');
          setTimeout(() => loadStepMarks(), 5000);
        }
      } catch (err: any) {
        if (err.message?.includes('429') || err.message?.includes('много запросов')) {
          console.warn('Rate limited - will retry step marks loading later');
          setTimeout(() => loadStepMarks(), 5000);
        } else {
          console.error('Error loading step marks:', err);
        }
      }
    };

    // Add a small delay to avoid rapid-fire API calls, and delay step marks after tv interface marks
    const timeoutId = setTimeout(loadStepMarks, 200);
    return () => clearTimeout(timeoutId);
  }, [stepId]);

  // Update container size when component mounts or resizes
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: width || rect.width || 800,
          height: height || rect.height || 450,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [width, height]);

  const handleMarkHover = (mark: TVInterfaceMark | null) => {
    setHoveredMark(mark);
    if (onMarkHover) {
      onMarkHover(mark);
    }
  };

  const getActiveMarks = () => {
    if (!highlightActiveMarks) return [];
    
    // Prioritize step-specific marks, then all marks
    const relevantMarks = stepMarks.length > 0 ? stepMarks : marks;
    
    return relevantMarks.filter(mark => 
      mark.is_active && 
      mark.is_visible &&
      (mark.priority === 'critical' || mark.priority === 'high' || stepMarks.includes(mark))
    );
  };

  const activeMarks = getActiveMarks();
  const displayMarks = showAllMarks ? marks : activeMarks;

  // Show hints for active marks
  const getHintText = () => {
    if (!showHints) return null;
    
    const activeMarkWithHint = activeMarks.find(mark => mark.hint_text || mark.action_description);
    if (activeMarkWithHint) {
      return activeMarkWithHint.hint_text || activeMarkWithHint.action_description;
    }
    
    if (hoveredMark?.hint_text) {
      return hoveredMark.hint_text;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-black rounded-lg ${className}`}>
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p className="text-sm">Загрузка интерфейса...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-black rounded-lg ${className}`}>
        <div className="text-center text-red-400">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!tvInterface) {
    return (
      <div className={`flex items-center justify-center bg-black rounded-lg ${className}`}>
        <div className="text-center text-gray-400">
          <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>TV интерфейс не выбран</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Main interface container */}
      <div
        ref={containerRef}
        className="relative w-full h-full"
        style={{
          aspectRatio: '16/9',
          minHeight: '200px',
        }}
      >
        {/* TV Interface image */}
        {tvInterface.screenshot_data ? (
          <img
            src={tvInterface.screenshot_data}
            alt={tvInterface.name}
            className="w-full h-full object-contain"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center">
              <Monitor className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">{tvInterface.name}</p>
              <p className="text-sm opacity-75">{tvInterface.type}</p>
            </div>
          </div>
        )}

        {/* Interface marks overlay */}
        {displayMarks.map((mark) => (
          <MarkDisplay
            key={mark.id}
            mark={mark}
            isActive={activeMarks.includes(mark)}
            isHovered={hoveredMark?.id === mark.id}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
            onMarkClick={onMarkClick}
            onMarkHover={handleMarkHover}
          />
        ))}

        {/* Step-specific TV area position highlight */}
        {tvAreaPosition && (
          <div
            className="absolute w-8 h-8 bg-blue-500 rounded-full border-4 border-white transform -translate-x-1/2 -translate-y-1/2 animate-pulse shadow-lg z-50"
            style={{
              left: `${(tvAreaPosition.x / 800) * containerSize.width}px`,
              top: `${(tvAreaPosition.y / 450) * containerSize.height}px`,
            }}
          >
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
            <Target className="absolute inset-0 w-4 h-4 text-white m-auto" />
          </div>
        )}

        {/* Interface info badges */}
        <div className="absolute top-2 left-2">
          <Badge variant="outline" className="bg-black/70 text-white border-gray-500">
            <Monitor className="h-3 w-3 mr-1" />
            {tvInterface.name}
          </Badge>
        </div>

        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-black/70 text-white">
            {tvInterface.type}
          </Badge>
        </div>

        {/* Active marks counter */}
        {activeMarks.length > 0 && (
          <div className="absolute bottom-2 right-2">
            <Badge className="bg-green-600 text-white">
              <Eye className="h-3 w-3 mr-1" />
              {activeMarks.length} активны��
            </Badge>
          </div>
        )}
      </div>

      {/* Hints panel */}
      {showHints && getHintText() && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
          <div className="flex items-start gap-2 text-yellow-200">
            <Lightbulb className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              {getHintText()}
            </p>
          </div>
        </div>
      )}

      {/* Hovered mark info */}
      {hoveredMark && (
        <div className="absolute top-12 left-2 right-2 z-60">
          <Card className="bg-black/80 border-gray-600">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-white text-sm">
                  <p className="font-medium">{hoveredMark.name}</p>
                  {hoveredMark.description && (
                    <p className="text-gray-300 mt-1">{hoveredMark.description}</p>
                  )}
                  {hoveredMark.action_description && (
                    <p className="text-blue-300 mt-1">
                      <strong>Действие:</strong> {hoveredMark.action_description}
                    </p>
                  )}
                  {hoveredMark.expected_result && (
                    <p className="text-green-300 mt-1">
                      <strong>Ожидаемый результат:</strong> {hoveredMark.expected_result}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TVInterfaceDisplay;
