package plugins_test

import (
	"testing"

	"github.com/QuantumNous/new-api/pkg/jsplugin"
	builtinplugins "github.com/QuantumNous/new-api/plugins"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestViduResponsesProtocol(t *testing.T) {
	testVideoResponsesProtocol(t, videoResponsesTestCase{
		pluginKey: "vidu",
		model:     "viduq2",
		requestBody: map[string]any{
			"model": "viduq2",
			"input": []any{map[string]any{"role": "user", "content": []any{
				map[string]any{"type": "input_text", "text": "move between frames"},
				map[string]any{"type": "input_image", "image_url": "https://cdn.example/first.png"},
				map[string]any{"type": "input_image", "image_url": "https://cdn.example/last.png"},
			}}},
			"seconds": 8,
			"size":    "720p",
		},
		wantAction: "first_tail_to_video",
		wantRequest: map[string]any{
			"model":    "viduq2",
			"prompt":   "move between frames",
			"images":   []any{"https://cdn.example/first.png", "https://cdn.example/last.png"},
			"duration": float64(8),
			"size":     "720p",
		},
		wantUsageKeys:       []string{"credits", "duration", "resolution"},
		wantSubmitUsageKeys: []string{"duration", "resolution"},
		wantVendorName:      "vidu",
	})
}

// metadata carries Vidu's other fields but cannot replace the model, duration
// or resolution the request is billed for.
func TestViduMetadataCannotChangeWhatIsBilled(t *testing.T) {
	source, err := builtinplugins.Source("vidu")
	require.NoError(t, err)
	plugin, err := jsplugin.NewRegistry().RegisterFactory(source, jsplugin.Options{Key: "vidu"})
	require.NoError(t, err)
	ctx := map[string]any{"baseUrl": "https://api.vidu.example", "apiKey": "vendor-key", "model": "vidu1.5", "upstreamModel": "vidu1.5",
		"requestBody": map[string]any{"model": "vidu1.5", "prompt": "p", "duration": 4, "resolution": "360p",
			"metadata": map[string]any{"model": "viduq2", "duration": 8, "resolution": "1080p", "seed": 7}}}
	descriptor, err := plugin.Engine.Call(t.Context(), "buildSubmitRequest", ctx)
	require.NoError(t, err)
	usage, err := plugin.Engine.Call(t.Context(), "extractUsage", ctx)
	require.NoError(t, err)
	body := decodePluginValue(t, descriptor)["body"].(map[string]any)
	assert.Equal(t, map[string]any{"duration": float64(4), "resolution": "360p"}, decodePluginValue(t, usage))
	assert.Equal(t, "vidu1.5", body["model"])
	assert.Equal(t, float64(4), body["duration"])
	assert.Equal(t, "360p", body["resolution"])
	assert.Equal(t, float64(7), body["seed"])
}
