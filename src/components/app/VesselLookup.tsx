"use client";

import { useState } from "react";
import { Search, Ship, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchVesselData } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

interface VesselData {
  name: string;
  owner: string;
  charterer: string;
  loa: string;
  dwt: string;
  built: string;
  flag: string;
  imo: string;
  mmsi: string;
  callSign: string;
  vesselType: string;
  classification: string;
}

interface VesselLookupProps {
  onVesselDataFound: (data: VesselData) => void;
  className?: string;
}

export function VesselLookup({ onVesselDataFound, className = "" }: VesselLookupProps) {
  const [vesselName, setVesselName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [vesselData, setVesselData] = useState<VesselData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLookup = async () => {
    if (!vesselName.trim()) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please enter a vessel name to search.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setVesselData(null);

    try {
      const result = await fetchVesselData(vesselName.trim());

      if (result.success && result.data) {
        setVesselData(result.data);
        onVesselDataFound(result.data);
        toast({
          title: "Vessel Found",
          description: `Successfully retrieved data for ${result.data.name}`,
        });
      } else {
        setError(result.error || "Failed to fetch vessel data");
        toast({
          variant: "destructive",
          title: "Lookup Failed",
          description: result.error || "Failed to fetch vessel data",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Lookup Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  const formatVesselInfo = (data: VesselData) => {
    return `Vessel: ${data.name}
Owner: ${data.owner}
Charterer: ${data.charterer}
LOA: ${data.loa}
DWT: ${data.dwt}
Built: ${data.built}
Flag: ${data.flag}
IMO: ${data.imo}
Vessel Type: ${data.vesselType}
Classification: ${data.classification}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ship className="h-5 w-5 text-primary" />
          Vessel Lookup
        </CardTitle>
        <CardDescription>
          Search for vessel information to pre-populate your fixture recap
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter vessel name (e.g., 'EVER GIVEN', 'MSC OSCAR')"
            value={vesselName}
            onChange={(e) => setVesselName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleLookup} 
            disabled={isLoading || !vesselName.trim()}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {isLoading ? "Searching..." : "Lookup"}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Vessel Data Display */}
        {vesselData && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Vessel data found and added to your fixture recap
              </AlertDescription>
            </Alert>

            <Card className="bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  {vesselData.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Owner:</span>
                      <span>{vesselData.owner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Charterer:</span>
                      <span>{vesselData.charterer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">LOA:</span>
                      <span>{vesselData.loa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">DWT:</span>
                      <span>{vesselData.dwt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Built:</span>
                      <span>{vesselData.built}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Flag:</span>
                      <Badge variant="outline">{vesselData.flag}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">IMO:</span>
                      <span className="font-mono">{vesselData.imo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">MMSI:</span>
                      <span className="font-mono">{vesselData.mmsi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Call Sign:</span>
                      <span className="font-mono">{vesselData.callSign}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Type:</span>
                      <Badge variant="outline">{vesselData.vesselType}</Badge>
                    </div>
                  </div>
                </div>

                {/* Pre-filled Fixture Recap */}
                <div className="mt-4 p-3 bg-background rounded border">
                  <h4 className="font-medium mb-2">Pre-filled Fixture Recap:</h4>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {formatVesselInfo(vesselData)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground">
          <p>💡 <strong>Tip:</strong> You can search by vessel name, IMO number, or call sign.</p>
          <p>🔍 <strong>Examples:</strong> "EVER GIVEN", "MSC OSCAR", "COSCO SHIPPING UNIVERSE"</p>
        </div>
      </CardContent>
    </Card>
  );
}

