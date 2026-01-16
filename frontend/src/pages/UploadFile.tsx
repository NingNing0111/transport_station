import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import Header from '../components/Header';
import { initFileUpload, uploadFileChunk, completeFileUpload } from '../lib/api';
import { Upload, CheckCircle, Copy } from 'lucide-react';

export default function UploadFile() {
  const [file, setFile] = useState<File | null>(null);
  const [expiration, setExpiration] = useState('10m');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedSize, setUploadedSize] = useState(0);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [result, setResult] = useState<{ short_link: string; visit_code: string } | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadedSize(0);
    setCurrentChunk(0);
    setTotalChunks(0);

    try {
      // 1. 初始化上传
      const initResponse = await initFileUpload(
        file.name,
        file.size,
        file.type || 'application/octet-stream',
        expiration
      );

      const { short_code, chunk_count, chunk_size } = initResponse;
      setTotalChunks(chunk_count);

      // 2. 分片上传
      const totalChunks = chunk_count;
      let uploadedChunks = 0;

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunk_size;
        const end = Math.min(start + chunk_size, file.size);
        const chunk = file.slice(start, end);

        setCurrentChunk(i + 1);

        try {
          await uploadFileChunk(short_code, i, chunk);
          uploadedChunks++;
          const uploadedBytes = Math.min((i + 1) * chunk_size, file.size);
          setUploadedSize(uploadedBytes);
          const progress = Math.round((uploadedChunks / totalChunks) * 100);
          setUploadProgress(progress);
        } catch (error) {
          console.error(`分片 ${i} 上传失败:`, error);
          throw new Error(`分片 ${i + 1} 上传失败，请重试`);
        }
      }

      // 3. 完成上传
      const completeResponse = await completeFileUpload(short_code);
      setResult({
        short_link: completeResponse.short_link,
        visit_code: completeResponse.visit_code,
      });
      setUploadProgress(100);
      setUploadedSize(file.size);
    } catch (error: any) {
      alert(error.message || '上传失败，请重试');
      console.error(error);
      setUploadProgress(0);
      setUploadedSize(0);
      setCurrentChunk(0);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  // 生成包含visitorCode的完整链接
  const getFullLink = (shortLink: string, visitCode: string) => {
    const url = new URL(shortLink);
    url.searchParams.set('visitCode', visitCode);
    return url.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="flex items-center justify-center p-4 py-12">
        <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>上传文件</CardTitle>
          <CardDescription>选择文件并设置过期时间，生成取件码和短链接</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!result ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">选择文件</label>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                {file && (
                  <p className="text-sm text-gray-500">
                    文件: {file.name} ({formatFileSize(file.size)})
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">过期时间</label>
                <Select value={expiration} onChange={(e) => setExpiration(e.target.value)}>
                  <option value="10m">10分钟</option>
                  <option value="1h">1小时</option>
                  <option value="1d">1天</option>
                  <option value="7d">7天</option>
                </Select>
              </div>

              {uploading && file && (
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">上传进度</span>
                    <span className="font-semibold text-blue-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      {uploadProgress > 10 && (
                        <span className="text-xs text-white font-medium">{uploadProgress}%</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {formatFileSize(uploadedSize)} / {formatFileSize(file.size)}
                    </span>
                    <span>
                      分片 {currentChunk} / {totalChunks}
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full"
                size="lg"
              >
                {uploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    上传中... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    上传文件
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">上传成功！</span>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">短链接（包含取件码）</label>
                <div className="flex space-x-2">
                  <Input value={getFullLink(result.short_link, result.visit_code)} readOnly />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(getFullLink(result.short_link, result.visit_code))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">取件码</label>
                <div className="flex space-x-2">
                  <Input value={result.visit_code} readOnly />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(result.visit_code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setFile(null);
                  }}
                  className="flex-1"
                >
                  继续上传
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  返回首页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
