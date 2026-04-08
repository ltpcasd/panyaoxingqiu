# 阿里云OSS部署脚本
# 用于部署潘瑶星球uni-app H5前端到OSS

# 配置参数
$BUCKET_NAME = "panyaoxingqiu-web"  # 请替换为你的Bucket名称
$REGION = "cn-hangzhou"
$DIST_PATH = "./dist/build/h5"  # uni-app H5构建输出目录

# 颜色输出函数
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "========================================"
Write-ColorOutput Green "  潘瑶星球前端部署脚本"
Write-ColorOutput Green "========================================"

# 检查是否安装阿里云CLI
Write-ColorOutput Yellow "[1/6] 检查阿里云CLI..."
$aliConfig = aliyun configure get 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "错误: 未安装阿里云CLI或未配置"
    Write-Output "请先安装阿里云CLI: https://help.aliyun.com/document_detail/121530.html"
    Write-Output "然后运行: aliyun configure"
    exit 1
}
Write-ColorOutput Green "阿里云CLI已配置"

# 检查Bucket是否存在
Write-ColorOutput Yellow "[2/6] 检查OSS Bucket..."
$bucketInfo = aliyun oss ls oss://$BUCKET_NAME 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Yellow "Bucket不存在，正在创建..."
    aliyun oss mb oss://$BUCKET_NAME --acl public-read
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Red "创建Bucket失败"
        exit 1
    }
}
Write-ColorOutput Green "Bucket检查完成"

# 配置Bucket网站托管
Write-ColorOutput Yellow "[3/6] 配置Bucket网站托管..."
$websiteConfig = @"
{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "index.html"}
}
"@
$websiteConfig | Out-File -FilePath ".\website-config.json" -Encoding UTF8
aliyun oss website --method put oss://$BUCKET_NAME website-config.json
Remove-Item ".\website-config.json"
Write-ColorOutput Green "网站托管配置完成"

# 配置CORS
Write-ColorOutput Yellow "[4/6] 配置CORS..."
$corsConfig = @"
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration>
    <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
        <AllowedMethod>POST</AllowedMethod>
        <AllowedMethod>PUT</AllowedMethod>
        <AllowedMethod>DELETE</AllowedMethod>
        <AllowedMethod>HEAD</AllowedMethod>
        <AllowedMethod>OPTIONS</AllowedMethod>
        <AllowedHeader>*</AllowedHeader>
        <ExposeHeader>ETag</ExposeHeader>
        <ExposeHeader>x-oss-request-id</ExposeHeader>
        <MaxAgeSeconds>3600</MaxAgeSeconds>
    </CORSRule>
</CORSConfiguration>
"@
$corsConfig | Out-File -FilePath ".\cors-config.xml" -Encoding UTF8
aliyun oss cors --method put oss://$BUCKET_NAME cors-config.xml
Remove-Item ".\cors-config.xml"
Write-ColorOutput Green "CORS配置完成"

# 上传文件
Write-ColorOutput Yellow "[5/6] 上传文件到OSS..."
if (-not (Test-Path $DIST_PATH)) {
    Write-ColorOutput Red "错误: 构建目录不存在: $DIST_PATH"
    Write-Output "请先运行: npm run build:h5"
    exit 1
}

# 上传所有文件
aliyun oss cp $DIST_PATH oss://$BUCKET_NAME/ --recursive --force
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "上传文件失败"
    exit 1
}

# 设置HTML文件的Content-Type
Get-ChildItem -Path $DIST_PATH -Filter "*.html" -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Replace((Resolve-Path $DIST_PATH).Path, "").Replace("\", "/")
    if ($relativePath.StartsWith("/")) {
        $relativePath = $relativePath.Substring(1)
    }
    aliyun oss set-meta oss://${BUCKET_NAME}/${relativePath} Content-Type:text/html --update
}

Write-ColorOutput Green "文件上传完成"

# 获取访问地址
Write-ColorOutput Yellow "[6/6] 获取访问地址..."
$endpoint = "http://${BUCKET_NAME}.oss-${REGION}.aliyuncs.com"
$websiteEndpoint = "http://${BUCKET_NAME}.oss-${REGION}.aliyuncs.com"

Write-ColorOutput Green "========================================"
Write-ColorOutput Green "  部署成功！"
Write-ColorOutput Green "========================================"
Write-Output ""
Write-Output "访问地址:"
Write-Output "  - OSS地址: $endpoint"
Write-Output "  - 网站地址: $websiteEndpoint"
Write-Output ""
Write-Output "注意:"
Write-Output "  1. 如需绑定自定义域名，请在阿里云控制台配置"
Write-Output "  2. 建议开启CDN加速以获得更好的访问速度"
Write-Output "  3. 生产环境请将CORS的AllowedOrigin设置为具体域名"
