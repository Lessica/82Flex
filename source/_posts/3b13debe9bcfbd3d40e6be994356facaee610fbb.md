---
title: 汇编作业 - 分别统计字符串中各字符数目
categories: Assembly
tags: [汇编]
date: 2015-12-03 12:24:00
---

已知某密码由英文字母 A、B、C … Z 组成且以 ASCII码形式存放在以CIPHER为首址的字节存储区中，试统计各字母在此密码中出现的次数并依次存入以CHAR为首址的26个字节中，最后将各字母出现的次数以十六进制形式显示出来（设出现次数＜255）。

``` asm
data segment
        ;input data segment code here
	CIPHER db 'AAABBCCCCCDDEEEFFFFFGGGHHIIIJJKKLLLLMMMMMMMNNOOPPQRRRRRRRRSSSTUUUUVVWWWXXXXXXXXXXXXXXXXXXXXXXXXXXXXXYYYYYZ','$'
	CHAR db 26 DUP(0)
	STR1 db 'H',0ah,0dh,'$'
data ends

stack segment
        ;input stack segment code here
	STA db 100 DUP(?)
stack ends

code segment
    assume cs:code,ds:data,ss:stack
start:
    mov ax,data
    mov ds,ax
        ;input code segment code here
	
    mov si,OFFSET CIPHER
count:
    mov di,OFFSET CHAR
    mov al,[si]
    cmp al,'$' ; if here comes the end of that string, jump to print proc
    je print
    xor ah,ah
    sub al,'A'
    add di,ax
    inc byte ptr [di] ; *(di + ax)++
    inc si
    jmp count
    
print:
    mov di,OFFSET CHAR
    mov dl,'A' ; from 'A' to 'Z'
    
list:
    mov ah,02h
    int 21h
    
    push dx ; backup dx
    push cx ; backup cx
    call printSpace
    
    xor dx,dx
    mov cl,4
    mov dl,[di]
    shr dl,cl ; only asc
    call printBit
    
    mov dl,[di]
    and dl,0fh ; only dsc
    call printBit
    
    mov ah,09h
    mov dx,OFFSET STR1 ; H\r\n
    int 21h
    
    pop cx ; restore cx
    pop dx ; restore dx
    
    inc dl
    inc di
    cmp dl,'Z'+1
    jb list
    
    mov ah,4ch ; the end
    int 21h
    
printSpace: ; sub proc: print 5 space chars
    push ax
    push cx
    push dx
    mov ah,02h
    mov cx,5
    mov dl,' '
space:
    int 21h
    loop space
    pop dx
    pop cx
    pop ax
    ret
    
printBit: ; sub proc: print the hex value at dl
    push ax
    push cx
    push dx
    mov ah,02h
    cmp dl,0ah
    jb number
    add dl,07h
number:
    add dl,30h
    int 21h
    pop dx
    pop cx
    pop ax
    ret
    
code ends
end start
```
