import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Header from '../components/Header';
import { FileText, MessageSquare, PackageSearch } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="flex items-center justify-center p-4 py-12">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold text-gray-900">中转站应用</h1>
            <p className="text-xl text-gray-600">安全、快速的文件和消息中转服务</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <CardTitle>文件中转站</CardTitle>
                </div>
                <CardDescription>
                  上传文件，生成取件码和短链接，安全分享给他人
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/upload/file">
                  <Button className="w-full" size="lg">
                    上传文件
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                  <CardTitle>消息中转站</CardTitle>
                </div>
                <CardDescription>
                  上传富文本消息，生成阅读码和短链接，安全分享给他人
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/upload/message">
                  <Button className="w-full" size="lg" variant="outline">
                    上传消息
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <PackageSearch className="h-8 w-8 text-purple-600" />
                  <CardTitle>取件</CardTitle>
                </div>
                <CardDescription>
                  输入取件码，获取对应的文件或消息内容
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/pickup">
                  <Button className="w-full" size="lg" variant="outline">
                    取件
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
