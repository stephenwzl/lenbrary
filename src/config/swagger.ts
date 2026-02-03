import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lenbrary Server API',
      version: '1.0.0',
      description: '资产管理系统 REST API 文档',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '本地开发服务器',
      },
    ],
    components: {
      schemas: {
        Asset: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '资产 ID',
            },
            original_name: {
              type: 'string',
              description: '原始文件名',
            },
            stored_name: {
              type: 'string',
              description: '存储文件名',
            },
            file_path: {
              type: 'string',
              description: '文件存储路径',
            },
            thumbnail_path: {
              type: 'string',
              description: '缩略图路径',
              nullable: true,
            },
            mime_type: {
              type: 'string',
              description: 'MIME 类型',
            },
            file_type: {
              type: 'string',
              enum: ['image', 'video'],
              description: '文件类型',
            },
            file_size: {
              type: 'integer',
              description: '文件大小(字节)',
            },
            width: {
              type: 'integer',
              description: '图片宽度(像素)',
              nullable: true,
            },
            height: {
              type: 'integer',
              description: '图片高度(像素)',
              nullable: true,
            },
            created_at: {
              type: 'integer',
              description: '创建时间戳',
            },
          },
        },
        ExifData: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'EXIF 数据 ID',
            },
            asset_id: {
              type: 'integer',
              description: '关联的资产 ID',
            },
            camera_make: {
              type: 'string',
              description: '相机品牌',
              nullable: true,
            },
            camera_model: {
              type: 'string',
              description: '相机型号',
              nullable: true,
            },
            datetime: {
              type: 'string',
              description: '拍摄日期和时间',
              nullable: true,
            },
            lens_model: {
              type: 'string',
              description: '镜头型号',
              nullable: true,
            },
            focal_length: {
              type: 'number',
              description: '焦距',
              nullable: true,
            },
            iso: {
              type: 'integer',
              description: 'ISO 感光度',
              nullable: true,
            },
            aperture: {
              type: 'number',
              description: '光圈值',
              nullable: true,
            },
            shutter_speed: {
              type: 'string',
              description: '快门速度',
              nullable: true,
            },
            gps_latitude: {
              type: 'number',
              description: 'GPS 纬度',
              nullable: true,
            },
            gps_longitude: {
              type: 'number',
              description: 'GPS 经度',
              nullable: true,
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/routes/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
