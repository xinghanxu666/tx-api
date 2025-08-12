package ali

import (
	"encoding/json"
	"io"
	"net/http"
	"one-api/common"
	"one-api/dto"
	relaycommon "one-api/relay/common"
	"one-api/types"

	"github.com/gin-gonic/gin"
)

func ConvertRerankRequest(request dto.RerankRequest) *AliRerankRequest {
	returnDocuments := request.ReturnDocuments
	if returnDocuments == nil {
		t := true
		returnDocuments = &t
	}
	return &AliRerankRequest{
		Model: request.Model,
		Input: AliRerankInput{
			Query:     request.Query,
			Documents: request.Documents,
		},
		Parameters: AliRerankParameters{
			TopN:            &request.TopN,
			ReturnDocuments: returnDocuments,
		},
	}
}

func RerankHandler(c *gin.Context, resp *http.Response, info *relaycommon.RelayInfo) (*types.NewAPIError, *dto.Usage) {
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return types.NewError(err, types.ErrorCodeReadResponseBodyFailed), nil
	}
	common.CloseResponseBodyGracefully(resp)

	var aliResponse AliRerankResponse
	err = json.Unmarshal(responseBody, &aliResponse)
	if err != nil {
		return types.NewError(err, types.ErrorCodeBadResponseBody), nil
	}

	if aliResponse.Code != "" {
		return types.WithOpenAIError(types.OpenAIError{
			Message: aliResponse.Message,
			Type:    aliResponse.Code,
			Param:   aliResponse.RequestId,
			Code:    aliResponse.Code,
		}, resp.StatusCode), nil
	}

	usage := dto.Usage{
		PromptTokens:     aliResponse.Usage.TotalTokens,
		CompletionTokens: 0,
		TotalTokens:      aliResponse.Usage.TotalTokens,
	}
	rerankResponse := dto.RerankResponse{
		Results: aliResponse.Output.Results,
		Usage:   usage,
	}

	jsonResponse, err := json.Marshal(rerankResponse)
	if err != nil {
		return types.NewError(err, types.ErrorCodeBadResponseBody), nil
	}
	c.Writer.Header().Set("Content-Type", "application/json")
	c.Writer.WriteHeader(resp.StatusCode)
	c.Writer.Write(jsonResponse)
	return nil, &usage
}
