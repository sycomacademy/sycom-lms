"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCourseDate } from "@/packages/utils/time";

type BlogPost = RouterOutputs["blog"]["list"]["posts"][number];

export function BlogCard({
  onDelete,
  onEdit,
  post,
}: {
  post: BlogPost;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card size="default">
      <AspectRatio ratio={16 / 10}>
        {post.imageUrl ? (
          <Image
            alt={post.title}
            className="h-full w-full object-cover"
            height={220}
            src={post.imageUrl}
            width={360}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-xs uppercase tracking-wide">
            No image
          </div>
        )}
      </AspectRatio>

      <CardHeader className="gap-3 pb-0">
        <CardTitle className="line-clamp-1 font-semibold text-base">
          {post.title}
        </CardTitle>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className="capitalize" variant="outline">
            {post.status}
          </Badge>
          <span className="text-muted-foreground text-xs">
            {post.author.name}
          </span>
        </div>
        <p className="text-muted-foreground text-xs uppercase tracking-wide">
          {post.publishedAt
            ? formatCourseDate(post.publishedAt)
            : "Unpublished"}
        </p>
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        <p className="line-clamp-4 text-muted-foreground text-sm leading-6">
          {post.excerpt}
        </p>
      </CardContent>

      <CardFooter className="items-center justify-end gap-2 border-t bg-muted/20">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button onClick={onDelete} size="icon-sm" variant="destructive">
                <Trash2Icon className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Delete post</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button onClick={onEdit} size="icon-sm" variant="outline">
                <PencilIcon className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Edit post</TooltipContent>
        </Tooltip>
      </CardFooter>
    </Card>
  );
}
